using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public interface IExpressionService
    {
        IEnumerable<Expression> GetExpressions();
        Expression CalculateExpression(OperationType operation, double firstOperand, double secondOperand);
        IEnumerable<ExpressionHistory> GetHistory(int limit = 100);
        int ClearHistory();
        Task StoreExpressionHistoryAsync(Expression expression, string? userIdentifier, CancellationToken cancellationToken = default);
    }
}
