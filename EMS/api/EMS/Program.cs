using EMS.Data;
using EMS.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;

// 🔹 DPAPI decryption helper
static string DecryptDpapi(string value)
{
    if (string.IsNullOrEmpty(value) || !value.StartsWith("DPAPI:"))
        return value;

    var b64 = value.Substring("DPAPI:".Length);
    var protectedBytes = Convert.FromBase64String(b64);

    var plainBytes = ProtectedData.Unprotect(
        protectedBytes,
        null,
        DataProtectionScope.LocalMachine
    );

    return Encoding.UTF8.GetString(plainBytes);
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — must use WithOrigins (not AllowAnyOrigin) so AllowCredentials works
var allowedOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();  // Required for cookie-based JWT from IMS frontend
    });
});

// 🔹 Get and decrypt connection string
var encrypted = builder.Configuration.GetConnectionString("DefaultAppDBConnection");
var decrypted = DecryptDpapi(encrypted);

// 🔹 Use decrypted string here
builder.Services.AddDbContext<EMSDbContext>(options =>
    options.UseMySql(decrypted, new MySqlServerVersion(new Version(8, 0, 23))));

// JWT Authentication — accepts IMS-issued JWTs (no Issuer/Audience, reads from cookie)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,          // IMS JWTs have no issuer
            ValidateAudience = false,        // IMS JWTs have no audience
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
        // Read JWT from IMS's HTTP-only cookie named "token"
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var cookieToken = ctx.Request.Cookies["token"];
                if (!string.IsNullOrEmpty(cookieToken))
                    ctx.Token = cookieToken;
                return Task.CompletedTask;
            }
        };
    });

// Earned Leave Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<SimplePayrollService>();
builder.Services.AddScoped<IUserActivityLogger, UserActivityLogger>();
builder.Services.AddScoped<AttendanceSyncService>();
builder.Services.AddScoped<EarnedLeaveAccrualService>();
builder.Services.AddScoped<EarnedLeaveEncashmentService>();
builder.Services.AddScoped<IIncrementProcessor, IncrementProcessor>();
builder.Services.AddHostedService<BackgroundAccrualHostedService>();
builder.Services.AddHostedService<SalaryIncrementSyncService>();

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();

app.Use(async (context, next) =>
{
    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Expires"] = "0";
    await next();
});

app.UseAuthorization();

app.UseStaticFiles();

app.MapControllers();

app.Run();
