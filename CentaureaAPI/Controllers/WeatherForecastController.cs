using Microsoft.AspNetCore.Mvc;
using CentaureaAPI.Models;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;

namespace CentaureaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly ILogger<WeatherForecastController> _logger;
        private readonly IWeatherService _weatherService;
        private readonly IEventQueue _eventQueue;

        public WeatherForecastController(
            ILogger<WeatherForecastController> logger, 
            IWeatherService weatherService,
            IEventQueue eventQueue)
        {
            _logger = logger;
            _weatherService = weatherService;
            _eventQueue = eventQueue;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IEnumerable<WeatherForecast> Get()
        {
            IEnumerable<WeatherForecast> forecast = _weatherService.GetForecast();
            
            if (forecast.Any())
            {
                StoreWeatherHistoryEvent storeEvent = new StoreWeatherHistoryEvent(forecast.First());
                _eventQueue.Enqueue(storeEvent);
            }
            
            return forecast;
        }

        [HttpGet("history", Name = "GetWeatherHistory")]
        public ActionResult<IEnumerable<WeatherRequestHistory>> GetHistory([FromQuery] int limit = 100)
        {
            IEnumerable<WeatherRequestHistory> history = _weatherService.GetHistory(limit);
            return Ok(history);
        }

        [HttpDelete("history", Name = "ClearWeatherHistory")]
        public ActionResult ClearHistory()
        {
            int count = _weatherService.ClearHistory();
            return Ok(new { message = $"Deleted {count} records from history" });
        }
    }
}
