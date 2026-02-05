using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public class CalculationStrategyFactory
    {
        private readonly Dictionary<OperationType, ICalculationStrategy> _strategies;

        public CalculationStrategyFactory()
        {
            _strategies = new Dictionary<OperationType, ICalculationStrategy>
            {
                { OperationType.Addition, new AdditionStrategy() },
                { OperationType.Subtraction, new SubtractionStrategy() },
                { OperationType.Multiplication, new MultiplicationStrategy() },
                { OperationType.Division, new DivisionStrategy() },
                { OperationType.Regexp, new RegexpStrategy() },
                { OperationType.Factorial, new FactorialStrategy() },
                { OperationType.Square, new SquareStrategy() },
                { OperationType.SquareRoot, new SquareRootStrategy() },
                { OperationType.Negate, new NegateStrategy() }
            };
        }

        public ICalculationStrategy GetStrategy(OperationType operationType)
        {
            if (_strategies.TryGetValue(operationType, out var strategy))
                return strategy;

            throw new ArgumentException($"Unknown operation type: {operationType}");
        }

        public IEnumerable<OperationType> GetAllOperationTypes()
        {
            return _strategies.Keys;
        }
    }
}
