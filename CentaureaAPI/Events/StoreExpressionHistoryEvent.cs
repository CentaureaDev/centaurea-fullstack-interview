using CentaureaAPI.Models;

namespace CentaureaAPI.Events
{
    public class StoreExpressionHistoryEvent : BackgroundEvent
    {
        public Expression Expression { get; }
        public int? UserId { get; }
        public string? UserEmail { get; }

        public StoreExpressionHistoryEvent(Expression expression, int? userId, string? userEmail)
        {
            Expression = expression;
            UserId = userId;
            UserEmail = userEmail;
        }

        public StoreExpressionHistoryEvent(Expression expression, int? userId, string? userEmail, DateTime startTime) : base(startTime)
        {
            Expression = expression;
            UserId = userId;
            UserEmail = userEmail;
        }
    }
}
