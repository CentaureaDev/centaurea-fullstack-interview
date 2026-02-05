using CentaureaAPI.Models;
using CentaureaAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace CentaureaAPI.Services
{
    public class ExpressionService : IExpressionService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ExpressionService> _logger;
        private readonly CalculationStrategyFactory _strategyFactory;

        public ExpressionService(ApplicationDbContext dbContext, ILogger<ExpressionService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
            _strategyFactory = new CalculationStrategyFactory();
        }

        public IEnumerable<Expression> GetExpressions()
        {
            // Generate sample expressions with both binary and unary operations
            var random = new Random();
            var operations = _strategyFactory.GetAllOperationTypes().ToArray();
            
            Expression[] expressions = Enumerable.Range(1, 8)
                .Select(index =>
                {
                    var operation = operations[random.Next(operations.Length)];
                    var strategy = _strategyFactory.GetStrategy(operation);
                    
                    double firstOperand = Math.Round(random.NextDouble() * 100, 2);
                    double secondOperand = operation switch
                    {
                        // Binary operations need secondOperand
                        OperationType.Addition or OperationType.Subtraction or 
                        OperationType.Multiplication or OperationType.Division => 
                            Math.Round(random.NextDouble() * 50 + 1, 2),
                        // Unary operations don't use secondOperand
                        _ => 0
                    };

                    double result = strategy.Calculate(firstOperand, secondOperand);
                    string expressionText = strategy.GenerateExpressionText(firstOperand, secondOperand, result);

                    return new Expression
                    {
                        Operation = operation,
                        FirstOperand = firstOperand,
                        SecondOperand = secondOperand,
                        Result = result,
                        ExpressionText = expressionText,
                        ComputedTime = DateTime.UtcNow
                    };
                })
                .ToArray();

            return expressions;
        }

        public Expression CalculateExpression(OperationType operation, double firstOperand, double secondOperand = 0)
        {
            var strategy = _strategyFactory.GetStrategy(operation);
            double result = strategy.Calculate(firstOperand, secondOperand);
            string expressionText = strategy.GenerateExpressionText(firstOperand, secondOperand, result);

            return new Expression
            {
                Operation = operation,
                FirstOperand = firstOperand,
                SecondOperand = secondOperand,
                Result = result,
                ExpressionText = expressionText,
                ComputedTime = DateTime.UtcNow
            };
        }

        public IEnumerable<ExpressionHistory> GetHistory(int limit = 100)
        {
            List<ExpressionHistory> history = _dbContext.ExpressionHistory
                .OrderByDescending(x => x.ComputedTime)
                .Take(limit)
                .ToList();

            return history;
        }

        public int ClearHistory()
        {
            int count = _dbContext.ExpressionHistory.Count();
            _dbContext.ExpressionHistory.RemoveRange(_dbContext.ExpressionHistory);
            _dbContext.SaveChanges();

            return count;
        }

        public async Task<ExpressionHistory?> UpdateHistoryComputedTimeAsync(int id, DateTime computedTime, CancellationToken cancellationToken = default)
        {
            ExpressionHistory? history = await _dbContext.ExpressionHistory
                .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (history == null)
            {
                return null;
            }

            DateTime normalized = computedTime.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(computedTime, DateTimeKind.Utc)
                : computedTime.ToUniversalTime();

            if (normalized > DateTime.UtcNow)
            {
                return null;
            }

            history.ComputedTime = normalized;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return history;
        }

        public async Task StoreExpressionHistoryAsync(Expression expression, int? userId, string? userEmail, CancellationToken cancellationToken = default)
        {
            ExpressionHistory history = new ExpressionHistory
            {
                ComputedTime = DateTime.UtcNow,
                Operation = expression.Operation,
                FirstOperand = expression.FirstOperand,
                SecondOperand = expression.SecondOperand,
                Result = expression.Result,
                ExpressionText = expression.ExpressionText,
                UserId = userId,
                UserEmail = userEmail ?? "anonymous"
            };
            
            await _dbContext.ExpressionHistory.AddAsync(history, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
