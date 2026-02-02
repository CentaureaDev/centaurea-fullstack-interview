namespace CentaureaAPI.Infrastructure
{
    public abstract class BackgroundEvent
    {

        protected BackgroundEvent()
        {
        }

        protected BackgroundEvent(DateTime startTime)
        {
            StartTime = startTime;
        }



        public DateTime? StartTime { get; }
    }
}
