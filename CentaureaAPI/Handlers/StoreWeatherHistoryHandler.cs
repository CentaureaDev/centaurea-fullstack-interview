using CentaureaAPI.Infrastructure;
using CentaureaAPI.Services;

namespace CentaureaAPI.Handlers
{
    public class StoreWeatherHistoryHandler : BaseBackgroundHandler<StoreWeatherHistoryEvent>
    {
        private readonly IWeatherService _weatherService;
        private readonly ILogger<StoreWeatherHistoryHandler> _logger;

        public StoreWeatherHistoryHandler(
            IWeatherService weatherService,
            ILogger<StoreWeatherHistoryHandler> logger)
        {
            _weatherService = weatherService;
            _logger = logger;
        }

        protected override async Task HandleEventAsync(StoreWeatherHistoryEvent backgroundEvent, CancellationToken token)
        {
            try
            {
                await _weatherService.StoreWeatherHistoryAsync(backgroundEvent.Forecast, token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error storing weather forecast in history via background event");
                throw;
            }
        }
    }
}
