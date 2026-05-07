using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace EMS.Services
{
    public class BackgroundAccrualHostedService : BackgroundService
    {
        private readonly ILogger<BackgroundAccrualHostedService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private DateTime _lastExecutionDate = DateTime.MinValue;
        private DateTime _lastEncashmentDate = DateTime.MinValue;

        public BackgroundAccrualHostedService(ILogger<BackgroundAccrualHostedService> logger, 
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("BackgroundAccrualHostedService started at: {time}", DateTime.UtcNow);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;

                    if (now.Date > _lastExecutionDate.Date)
                    {
                        await ProcessDailyAccrualAsync();
                        _lastExecutionDate = now;
                    }

                    if (now.Month == 12 && now.Day == 31 && now.Date > _lastEncashmentDate.Date)
                    {
                        await ProcessYearEndEncashmentAsync();
                        _lastEncashmentDate = now;
                    }

                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in BackgroundAccrualHostedService");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("BackgroundAccrualHostedService stopped at: {time}", DateTime.UtcNow);
        }

        private async Task ProcessDailyAccrualAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var accrualService = scope.ServiceProvider.GetRequiredService<EarnedLeaveAccrualService>();
                _logger.LogInformation("Processing daily earned leave accrual at: {time}", DateTime.UtcNow);
                await accrualService.ProcessDailyAccrualAsync();
                _logger.LogInformation("Daily accrual processing completed at: {time}", DateTime.UtcNow);
            }
        }

        private async Task ProcessYearEndEncashmentAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var encashmentService = scope.ServiceProvider.GetRequiredService<EarnedLeaveEncashmentService>();
                var currentYear = DateTime.UtcNow.Year;
                _logger.LogInformation("Processing year-end encashment for year {year} at: {time}", 
                    currentYear, DateTime.UtcNow);
                await encashmentService.ProcessYearEndEncashmentAsync(currentYear);
                _logger.LogInformation("Year-end encashment processing completed at: {time}", DateTime.UtcNow);
            }
        }
    }
}
