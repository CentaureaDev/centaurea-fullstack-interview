using CentaureaAPI.Models;

namespace CentaureaAPI.Infrastructure
{
    public class StoreExpressionHistoryEvent : BackgroundEvent
    {
        public Expression Expression { get; }
        public string? UserIdentifier { get; }

        public StoreExpressionHistoryEvent(Expression expression, string? userIdentifier = null)
        {
            Expression = expression;
            UserIdentifier = userIdentifier;
        }

        public StoreExpressionHistoryEvent(Expression expression, string? userIdentifier, DateTime startTime) : base(startTime)
        {
            Expression = expression;
            UserIdentifier = userIdentifier;
        }
    }
}
