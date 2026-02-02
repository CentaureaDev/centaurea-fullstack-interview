using CentaureaAPI.Models;
using CentaureaAPI.Data;

namespace CentaureaAPI.Services
{
    public class ExpressionService : IExpressionService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ExpressionService> _logger;

        public ExpressionService(ApplicationDbContext dbContext, ILogger<ExpressionService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public IEnumerable<Expression> GetExpressions()
        {
            // Generate sample expressions
            var random = new Random();
            var operations = Enum.GetValues<OperationType>();
            
            Expression[] expressions = Enumerable.Range(1, 5)
                .Select(index =>
                {
                    var operation = operations[random.Next(operations.Length)];
                    return new Expression
                    {
                        Operation = operation,
                        FirstOperand = Math.Round(random.NextDouble() * 100, 2),
                        SecondOperand = Math.Round(random.NextDouble() * 50 + 1, 2) // Avoid zero for division
                    };
                })
                .ToArray();

            return expressions;
        }

        public Expression CalculateExpression(OperationType operation, double firstOperand, double secondOperand)
        {
            return new Expression
            {
                Operation = operation,
                FirstOperand = firstOperand,
                SecondOperand = secondOperand
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

        public async Task StoreExpressionHistoryAsync(Expression expression, int? userId, string? userEmail, CancellationToken cancellationToken = default)
        {
            ExpressionHistory history = new ExpressionHistory
            {
                ComputedTime = DateTime.UtcNow,
                Operation = expression.Operation,
                FirstOperand = expression.FirstOperand,
                SecondOperand = expression.SecondOperand,
                Result = expression.Result,
                UserId = userId,
                UserEmail = userEmail ?? "anonymous"
            };
            
            await _dbContext.ExpressionHistory.AddAsync(history, cancellationToken);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
