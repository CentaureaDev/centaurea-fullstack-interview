using CentaureaAPI.Infrastructure;
using CentaureaAPI.Models;
using CentaureaAPI.Services;
using CentaureaAPI.Events;

namespace CentaureaAPI.Handlers
{
    /// <summary>
    /// Base handler for expression calculation events.
    /// Subclasses implement specific operation calculations.
    /// </summary>
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
                // Calculate result using the operation's strategy
                double result = _strategy.Calculate(backgroundEvent.FirstOperand, backgroundEvent.SecondOperand);
                
                // Generate expression text
                string expressionText = _strategy.GenerateExpressionText(
                    backgroundEvent.FirstOperand,
                    backgroundEvent.SecondOperand,
                    result);

                // Create expression object
                var expression = new Expression
                {
                    Operation = backgroundEvent.OperationType,
                    FirstOperand = backgroundEvent.FirstOperand,
                    SecondOperand = backgroundEvent.SecondOperand,
                    Result = result,
                    ExpressionText = expressionText
                };

                // Store in history
                await _expressionService.StoreExpressionHistoryAsync(
                    expression,
                    backgroundEvent.UserId,
                    backgroundEvent.UserEmail,
                    token);

                // Set result on event so controller can return it
                backgroundEvent.Result = expression;

                _logger.LogInformation(
                    "Expression calculated: {ExpressionText} (User: {UserEmail})",
                    expressionText,
                    backgroundEvent.UserEmail ?? "anonymous");
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

    // Binary operation handlers
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
    }

    // Unary operation handlers
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
}
