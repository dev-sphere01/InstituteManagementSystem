using System;
using System.IO;
namespace EMS.Services
{
    public static class FileLogger
    {
        private static readonly string LogDirectory =
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");

        public static void Log(string message)
        {
            if (!Directory.Exists(LogDirectory))
                Directory.CreateDirectory(LogDirectory);

            string filePath = Path.Combine(
                LogDirectory,
                $"LeaveRegularization_{DateTime.Now:yyyyMMdd}.log"
            );

            string logEntry =
                $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} | {message}{Environment.NewLine}";

            File.AppendAllText(filePath, logEntry);
        }
        public static void LogMessage(string message)
        {
            if (!Directory.Exists(LogDirectory))
                Directory.CreateDirectory(LogDirectory);

            string filePath = Path.Combine(
                LogDirectory,
                $"LeaveUpload_{DateTime.Now:yyyyMMdd}.log"
            );

            string logEntry =
                $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} | {message}{Environment.NewLine}";

            File.AppendAllText(filePath, logEntry);
        }
    }
}
