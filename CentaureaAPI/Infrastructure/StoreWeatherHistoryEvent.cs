using CentaureaAPI.Models;

namespace CentaureaAPI.Infrastructure
{
    public class StoreWeatherHistoryEvent : BackgroundEvent
    {
        public WeatherForecast Forecast { get; }

        public StoreWeatherHistoryEvent(WeatherForecast forecast)
        {
            Forecast = forecast;
        }

        public StoreWeatherHistoryEvent(WeatherForecast forecast, DateTime startTime) : base(startTime)
        {
            Forecast = forecast;
        }
    }
}
