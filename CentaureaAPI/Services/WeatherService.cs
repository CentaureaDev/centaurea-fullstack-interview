using CentaureaAPI.Models;
using CentaureaAPI.Data;

namespace CentaureaAPI.Services
{
    public class WeatherService : IWeatherService
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<WeatherService> _logger;

        public WeatherService(ApplicationDbContext dbContext, ILogger<WeatherService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public IEnumerable<WeatherForecast> GetForecast()
        {
            WeatherForecast[] forecast = Enumerable.Range(1, 5)
                .Select(index => new WeatherForecast
                {
                    Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    TemperatureC = Random.Shared.Next(-20, 55),
                    Summary = Summaries[Random.Shared.Next(Summaries.Length)]
                })
                .ToArray();

            return forecast;
        }

        public IEnumerable<WeatherRequestHistory> GetHistory(int limit = 100)
        {
            List<WeatherRequestHistory> history = _dbContext.WeatherHistory
                .OrderByDescending(x => x.RequestTime)
                .Take(limit)
                .ToList();

            return history;
        }

        public int ClearHistory()
        {
            int count = _dbContext.WeatherHistory.Count();
            _dbContext.WeatherHistory.RemoveRange(_dbContext.WeatherHistory);
            _dbContext.SaveChanges();

            return count;
        }

        public async Task StoreWeatherHistoryAsync(WeatherForecast forecast, CancellationToken cancellationToken = default)
        {
            WeatherRequestHistory history = new WeatherRequestHistory
            {
                RequestTime = DateTime.UtcNow,
                TemperatureC = forecast.TemperatureC,
                Summary = forecast.Summary,
                TemperatureF = forecast.TemperatureF
            };
            
            await _dbContext.WeatherHistory.AddAsync(history, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
