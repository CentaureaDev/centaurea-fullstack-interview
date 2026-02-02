namespace CentaureaAPI.Models
{
    public class WeatherRequestHistory
    {
        public int Id { get; set; }
        public DateTime RequestTime { get; set; }
        public int TemperatureC { get; set; }
        public string? Summary { get; set; }
        public int TemperatureF { get; set; }
    }
}
