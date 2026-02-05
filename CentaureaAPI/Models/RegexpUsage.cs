namespace CentaureaAPI.Models
{
    public class RegexpUsage
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime Date { get; set; } // Date only, normalized to start of day
        public int Count { get; set; } // Number of regexp calculations that day
    }
}
