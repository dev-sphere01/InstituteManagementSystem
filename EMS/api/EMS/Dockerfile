# ==========================================
# Build Stage (.NET 8.0 SDK)
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy project file and restore dependencies
COPY ["EMS.csproj", "./"]
RUN dotnet restore "EMS.csproj"

# Copy remaining source code and publish Release build
COPY . .
RUN dotnet publish "EMS.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ==========================================
# Runtime Stage (ASP.NET 8.0 Runtime)
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runner

WORKDIR /app

# Install curl for robust container health checks (Debian slim lacks curl/wget by default)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published output from build stage
COPY --from=build /app/publish .

# Provide sanitized default appsettings.json without credentials
RUN echo '{"Logging":{"LogLevel":{"Default":"Information","Microsoft.AspNetCore":"Warning"}},"AllowedHosts":"*"}' > /app/appsettings.json

# Ensure wwwroot folders exist for upload storage
RUN mkdir -p wwwroot/CancelledCheque wwwroot/Docs wwwroot/PreviousExperience wwwroot/ProfilePictures

# Bind Kestrel to 0.0.0.0 on port 5001 inside container
ENV ASPNETCORE_URLS=http://+:5001 \
    ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5001

# Health check against Locations public GET endpoint (Swagger is disabled in Production)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:5001/api/Locations || exit 1

ENTRYPOINT ["dotnet", "EMS.dll"]
