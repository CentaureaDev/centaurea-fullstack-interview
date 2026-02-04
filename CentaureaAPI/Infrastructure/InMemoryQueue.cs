using System.Collections.Concurrent;
using CentaureaAPI.Events;


namespace CentaureaAPI.Infrastructure
{
    public interface IEventQueue
    {
        void Enqueue(params BackgroundEvent[] events);

        Task<bool> EnqueueAwaitingAsync(BackgroundEvent @event, TimeSpan timoute);

        Task<BackgroundEvent> TryDequeue(CancellationToken cancellationToken);
    }

    public class InMemoryEventQueue : IEventQueue
    {
        private static readonly Lazy<InMemoryEventQueue> _instance
            = new Lazy<InMemoryEventQueue>(() => new InMemoryEventQueue());

        private readonly ConcurrentQueue<BackgroundEvent> _eventStorage = new ConcurrentQueue<BackgroundEvent>();
        private readonly ConcurrentQueue<BackgroundEvent> _priorityQueue = new ConcurrentQueue<BackgroundEvent>();
        private readonly ConcurrentQueue<BackgroundEvent> _delayedStorage = new ConcurrentQueue<BackgroundEvent>();

        private readonly SemaphoreSlim _signal = new SemaphoreSlim(0);

        protected InMemoryEventQueue()
        {
        }

        public int RegularEventsCount => _eventStorage.Count;

        public static IEventQueue BuildQueue()
        {
            InMemoryEventQueue q = _instance.Value;
            return q;
        }

        public void Enqueue(params BackgroundEvent[] events)
        {
            foreach (BackgroundEvent @event in events.Where(e => e != null))
            {
                ConcurrentQueue<BackgroundEvent> store = @event is SyncProcessEvent ? _priorityQueue : _eventStorage;
                store.Enqueue(@event);
                _signal.Release();
            }
        }

        public Task<bool> EnqueueAwaitingAsync(BackgroundEvent @event, TimeSpan timeout)
        {
            SyncProcessEvent syncProcessEvent = new SyncProcessEvent(@event);
            Enqueue(syncProcessEvent);
            return syncProcessEvent.Lock.WaitAsync(timeout);
        }

        public async Task<BackgroundEvent> TryDequeue(CancellationToken cancellationToken)
        {
            await _signal.WaitAsync(cancellationToken);
            BackgroundEvent @event;

            while (_priorityQueue.TryDequeue(out @event) || _eventStorage.TryDequeue(out @event))
            {
                if (@event?.StartTime != null && @event.StartTime > DateTime.UtcNow)
                {
                    _delayedStorage.Enqueue(@event);
                }
                else
                {
                    break;
                }
            }

            while (_delayedStorage.TryDequeue(out BackgroundEvent delayedEvent))
            {
                // Do not await not to block execution. Enqueue will be done in another thread
                _ = Task.Delay(TimeSpan.FromMinutes(1), CancellationToken.None).ContinueWith(task =>
                {
                    Enqueue(delayedEvent); // return back delayed events
                }, CancellationToken.None);
            }

            return @event;
        }

#if !PRODUCTION
        public void Clear()
        {
            _priorityQueue.Clear();
            _eventStorage.Clear();
            _delayedStorage.Clear();
        }
#endif
    }
}
