using CentaureaAPI.Infrastructure;
using CentaureaAPI.Services;

namespace CentaureaAPI.Handlers
{
    public class StoreExpressionHistoryHandler : BaseBackgroundHandler<StoreExpressionHistoryEvent>
    {
        private readonly IExpressionService _expressionService;
        private readonly ILogger<StoreExpressionHistoryHandler> _logger;

        public StoreExpressionHistoryHandler(
            IExpressionService expressionService,
            ILogger<StoreExpressionHistoryHandler> logger)
        {
            _expressionService = expressionService;
            _logger = logger;
        }

        protected override async Task HandleEventAsync(StoreExpressionHistoryEvent backgroundEvent, CancellationToken token)
        {
            try
            {
                await _expressionService.StoreExpressionHistoryAsync(
                    backgroundEvent.Expression, 
                    backgroundEvent.UserIdentifier, 
                    token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error storing expression in history via background event");
                throw;
            }
        }
    }
}
