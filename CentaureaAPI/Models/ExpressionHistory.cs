namespace CentaureaAPI.Models
{
    public class ExpressionHistory
    {
        public int Id { get; set; }
        public DateTime ComputedTime { get; set; }
        public OperationType Operation { get; set; }
        public double FirstOperand { get; set; }
        public double SecondOperand { get; set; }
        public double Result { get; set; }
        public string ExpressionText { get; set; } = string.Empty; // Visual representation
        public int? UserId { get; set; }
        public string? UserEmail { get; set; }
    }
}
