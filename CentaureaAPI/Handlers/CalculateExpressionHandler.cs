using CentaureaAPI.Infrastructure;
using CentaureaAPI.Models;
using CentaureaAPI.Services;
using CentaureaAPI.Events;

namespace CentaureaAPI.Handlers
{
    public abstract class BaseCalculateExpressionHandler<TEvent> : BaseBackgroundHandler<TEvent> where TEvent : CalculateExpressionEvent
    {
        protected readonly IExpressionService _expressionService;
        protected readonly ICalculationStrategy _strategy;
        protected readonly ILogger<BaseCalculateExpressionHandler<TEvent>> _logger;

        protected BaseCalculateExpressionHandler(
            IExpressionService expressionService,
            ICalculationStrategy strategy,
            ILogger<BaseCalculateExpressionHandler<TEvent>> logger)
        {
            _expressionService = expressionService;
            _strategy = strategy;
            _logger = logger;
        }

        protected override async Task HandleEventAsync(TEvent backgroundEvent, CancellationToken token)
        {
            try
            {
                double result = _strategy.Calculate(backgroundEvent.FirstOperand, backgroundEvent.SecondOperand);
                string expressionText = _strategy.GenerateExpressionText(
                    backgroundEvent.FirstOperand,
                    backgroundEvent.SecondOperand,
                    result);

                Expression expression = new Expression
                {
                    Operation = backgroundEvent.OperationType,
                    FirstOperand = backgroundEvent.FirstOperand,
                    SecondOperand = backgroundEvent.SecondOperand,
                    Result = result,
                    ExpressionText = expressionText
                };

                await _expressionService.StoreExpressionHistoryAsync(
                    expression,
                    backgroundEvent.UserId,
                    backgroundEvent.UserEmail,
                    token);

                backgroundEvent.Result = expression;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error calculating expression: Operation={Operation}, First={First}, Second={Second}",
                    backgroundEvent.OperationType,
                    backgroundEvent.FirstOperand,
                    backgroundEvent.SecondOperand);
                throw;
            }
        }
    }

    public class AdditionHandler : BaseCalculateExpressionHandler<AdditionEvent>
    {
        public AdditionHandler(IExpressionService expressionService, ILogger<AdditionHandler> logger)
            : base(expressionService, new AdditionStrategy(), logger) { }
    }

    public class SubtractionHandler : BaseCalculateExpressionHandler<SubtractionEvent>
    {
        public SubtractionHandler(IExpressionService expressionService, ILogger<SubtractionHandler> logger)
            : base(expressionService, new SubtractionStrategy(), logger) { }
    }

    public class MultiplicationHandler : BaseCalculateExpressionHandler<MultiplicationEvent>
    {
        public MultiplicationHandler(IExpressionService expressionService, ILogger<MultiplicationHandler> logger)
            : base(expressionService, new MultiplicationStrategy(), logger) { }
    }

    public class DivisionHandler : BaseCalculateExpressionHandler<DivisionEvent>
    {
        public DivisionHandler(IExpressionService expressionService, ILogger<DivisionHandler> logger)
            : base(expressionService, new DivisionStrategy(), logger) { }
            
        protected override async Task HandleEventAsync(DivisionEvent backgroundEvent, CancellationToken token)
        {
            if (backgroundEvent.SecondOperand == 0)
            {
                throw new ArgumentException("Cannot divide by zero");
            }
            
            await base.HandleEventAsync(backgroundEvent, token);
        }
    }

    public class FactorialHandler : BaseCalculateExpressionHandler<FactorialEvent>
    {
        public FactorialHandler(IExpressionService expressionService, ILogger<FactorialHandler> logger)
            : base(expressionService, new FactorialStrategy(), logger) { }
    }

    public class SquareHandler : BaseCalculateExpressionHandler<SquareEvent>
    {
        public SquareHandler(IExpressionService expressionService, ILogger<SquareHandler> logger)
            : base(expressionService, new SquareStrategy(), logger) { }
    }

    public class SquareRootHandler : BaseCalculateExpressionHandler<SquareRootEvent>
    {
        public SquareRootHandler(IExpressionService expressionService, ILogger<SquareRootHandler> logger)
            : base(expressionService, new SquareRootStrategy(), logger) { }
    }

    public class NegateHandler : BaseCalculateExpressionHandler<NegateEvent>
    {
        public NegateHandler(IExpressionService expressionService, ILogger<NegateHandler> logger)
            : base(expressionService, new NegateStrategy(), logger) { }
    }

    public class RegexpHandler : BaseBackgroundHandler<RegexpEvent>
    {
        private readonly IExpressionService _expressionService;
        private readonly ILogger<RegexpHandler> _logger;

        public RegexpHandler(IExpressionService expressionService, ILogger<RegexpHandler> logger)
        {
            _expressionService = expressionService;
            _logger = logger;
        }

        protected override async Task HandleEventAsync(RegexpEvent backgroundEvent, CancellationToken token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(backgroundEvent.Pattern))
                {
                    throw new ArgumentException("Pattern is required for Regexp operation");
                }
                
                if (string.IsNullOrWhiteSpace(backgroundEvent.Text))
                {
                    throw new ArgumentException("Text is required for Regexp operation");
                }
                
                if (!backgroundEvent.UserId.HasValue)
                {
                    throw new UnauthorizedAccessException("User authentication required for Regexp operations");
                }
                
                if (backgroundEvent.UserId.HasValue)
                {
                    (int used, int remaining) = await _expressionService.GetRegexpUsageForTodayAsync(backgroundEvent.UserId.Value, token);
                    backgroundEvent.RegexpUsed = used;
                    backgroundEvent.RegexpRemaining = remaining;

                    if (remaining <= 0)
                    {
                        throw new InvalidOperationException($"Daily regexp limit reached. You have used {used} out of 5 regexp calculations today. Try again tomorrow.");
                    }
                }

                (double result, string expressionText) = RegexpStrategy.CalculateRegexp(backgroundEvent.Pattern, backgroundEvent.Text);

                Expression expression = new Expression
                {
                    Operation = OperationType.Regexp,
                    FirstOperand = 0,
                    SecondOperand = 0,
                    Result = result,
                    ExpressionText = expressionText
                };

                await _expressionService.StoreExpressionHistoryAsync(
                    expression,
                    backgroundEvent.UserId,
                    backgroundEvent.UserEmail,
                    token);

                if (backgroundEvent.UserId.HasValue)
                {
                    await _expressionService.IncrementRegexpUsageAsync(backgroundEvent.UserId.Value, token);
                    backgroundEvent.RegexpUsed++;
                    backgroundEvent.RegexpRemaining--;
                }

                backgroundEvent.Result = expression;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error calculating regexp: Pattern={Pattern}, Text={Text}",
                    backgroundEvent.Pattern,
                    backgroundEvent.Text);
                throw;
            }
        }
    }
}
