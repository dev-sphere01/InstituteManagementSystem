using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using EMS.Data;
using EMS.Models;

namespace EMS.Services
{
    public class SalaryIncrementSyncService : BackgroundService
    {
        private readonly ILogger<SalaryIncrementSyncService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public SalaryIncrementSyncService(ILogger<SalaryIncrementSyncService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SalaryIncrementSyncService is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessIncrementsAsync();
                    // Run every hour to check for new increments that reached their WEF date
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing SalaryIncrementSyncService.");
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("SalaryIncrementSyncService is stopping.");
        }

        private async Task ProcessIncrementsAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var processor = scope.ServiceProvider.GetRequiredService<IIncrementProcessor>();
                await processor.ProcessPendingIncrementsAsync();
            }
        }
    }
}
