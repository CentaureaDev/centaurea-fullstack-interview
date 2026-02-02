using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public interface IWeatherService
    {
        IEnumerable<WeatherForecast> GetForecast();
        IEnumerable<WeatherRequestHistory> GetHistory(int limit = 100);
        int ClearHistory();
        Task StoreWeatherHistoryAsync(WeatherForecast forecast, CancellationToken cancellationToken = default);
    }
}
