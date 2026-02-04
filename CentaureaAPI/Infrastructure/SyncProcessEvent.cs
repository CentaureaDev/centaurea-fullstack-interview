using CentaureaAPI.Events;

namespace CentaureaAPI.Infrastructure
{
    public class SyncProcessEvent : BackgroundEvent
    {
        public BackgroundEvent BackgroundEvent { get; private set; }

        public SemaphoreSlim Lock { get; private set; }

        public SyncProcessEvent(BackgroundEvent @event)
        {
            BackgroundEvent = @event;
            Lock = new SemaphoreSlim(0);
        }
    }
}
