using System.Collections.Concurrent;
using System.Globalization;
using CentaureaAPI.Handlers;
using CentaureaAPI.Settings;
using Microsoft.Extensions.Options;

namespace CentaureaAPI.Infrastructure
{
    public class InMemoryBackgroundExecutor : IHostedService
    {
        private const int SecondsDelay = 1;
        private readonly int _batchSize = 10;

        private readonly ConcurrentDictionary<Type, Type> _typeToHandlerTypeMapping = new ConcurrentDictionary<Type, Type>();

        private readonly CancellationTokenSource _cancelTknSrc = new CancellationTokenSource();

        private readonly IEventQueue _queue;
        private readonly IServiceProvider _provider;
        private readonly ILogger<InMemoryBackgroundExecutor> _logger;
        private Task _backgroundTask;

        public InMemoryBackgroundExecutor(IServiceProvider serviceProvider, IEventQueue queue, ILogger<InMemoryBackgroundExecutor> logger)
        {
            _provider = serviceProvider;
            _queue = queue;
            _logger = logger;       
        }

        public virtual Task StartAsync(CancellationToken cancellationToken)
        {
            _backgroundTask = Task.Run(Process);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _cancelTknSrc.Cancel();
            return Task.WhenAny(_backgroundTask, Task.Delay(Timeout.Infinite, cancellationToken));
        }

        private static void SetCultureFoThread(IServiceScope serviceScope)
        {
            IOptions<CultureSettings> regionalSettings = serviceScope.ServiceProvider.GetService<IOptions<CultureSettings>>();

            CultureInfo.CurrentCulture = regionalSettings.Value.GetCulture();
            CultureInfo.CurrentUICulture = regionalSettings.Value.GetCulture();
        }

        private async Task Process()
        {
            while (!_cancelTknSrc.IsCancellationRequested)
            {
                try
                {
                    IEnumerable<Task<BackgroundEvent>> toProcess = Enumerable.Range(0, _batchSize)
                        .Select((i) => _queue.TryDequeue(_cancelTknSrc.Token));

                    Task[] tasks = toProcess.Select((eventResolver) => Task.Run(async () => await RunSingleEventTask(eventResolver))).ToArray();

                    Task.WaitAll(tasks, _cancelTknSrc.Token);

                    await Task.Delay(TimeSpan.FromSeconds(SecondsDelay), _cancelTknSrc.Token);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing background tasks: {exceptionMessage}", ex.Message);
                }
            }
        }

        private async Task RunSingleEventTask(Task<BackgroundEvent> eventResolver)
        {
            using (IServiceScope scope = _provider.CreateScope())
            {
                BackgroundEvent @event = await eventResolver;
                SemaphoreSlim syncContext = null;

                if (@event != null)
                {
                    if (@event is SyncProcessEvent ev)
                    {
                        syncContext = ev.Lock;
                        @event = ev.BackgroundEvent;
                    }

                    SetCultureFoThread(scope);

                    IEnumerable<IBackgroundHandler<BackgroundEvent>>
                        handlers = FindProperHandlerForEvent(@event, scope);

                    Task[] ongoingTasks = handlers
                        .Select(hdl => Task.Run(async () => await hdl.HandleAsync(@event, _cancelTknSrc.Token), _cancelTknSrc.Token))
                        .ToArray();

                    try
                    {
                        Task.WaitAll(ongoingTasks, _cancelTknSrc.Token);
                    }
                    catch (AggregateException ex)
                    {
                        _logger.LogError(ex, "Failed to execute background tasks: {exceptionMessage}", ex.Message);
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(e, "Failed to execute background tasks: {exceptionMessage}", e.Message);
                    }
                    finally
                    {
                        if (syncContext != null)
                        {
                            syncContext.Release();
                        }
                    }
                }
            }

            _logger.LogWarning("[RunSingleEventTask]: Finished!");
        }

        private IEnumerable<IBackgroundHandler<BackgroundEvent>> FindProperHandlerForEvent(
            BackgroundEvent eventToHandle, IServiceScope scope)
        {
            Type typeToResolve = _typeToHandlerTypeMapping.GetOrAdd(eventToHandle.GetType(), tIn =>
            {
                Type type = typeof(IBackgroundHandler<>);
                return type.MakeGenericType(tIn);
            });

            return scope.ServiceProvider.GetServices(typeToResolve).Cast<IBackgroundHandler<BackgroundEvent>>();
        }
    }
}
