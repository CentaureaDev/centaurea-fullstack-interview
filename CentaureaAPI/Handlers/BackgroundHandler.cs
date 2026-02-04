using CentaureaAPI.Events;

namespace CentaureaAPI.Handlers
{
    public interface IBackgroundHandler<out TEvent> where TEvent : BackgroundEvent
    {
        Task HandleAsync(BackgroundEvent backgroundEvent, CancellationToken token);
    }

    public abstract class BaseBackgroundHandler<TEvent> : IBackgroundHandler<TEvent> where TEvent : BackgroundEvent
    {
        protected abstract Task HandleEventAsync(TEvent backgroundEvent, CancellationToken token);

        public virtual async Task HandleAsync(BackgroundEvent backgroundEvent, CancellationToken token)
        {
            if (backgroundEvent is TEvent @event && !token.IsCancellationRequested)
            {
                await HandleEventAsync(@event, token);
            }
        }
    }
}