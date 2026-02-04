using CentaureaAPI.Models;

namespace CentaureaAPI.Services
{
    public interface IExpressionService
    {
        IEnumerable<Expression> GetExpressions();
        Expression CalculateExpression(OperationType operation, double firstOperand, double secondOperand = 0);
        IEnumerable<ExpressionHistory> GetHistory(int limit = 100);
        int ClearHistory();
        Task StoreExpressionHistoryAsync(Expression expression, int? userId, string? userEmail, CancellationToken cancellationToken = default);
    }
}
