namespace CentaureaAPI.Models
{
    public enum OperationType
    {
        // Binary operations
        Addition,
        Subtraction,
        Multiplication,
        Division,
        Regexp, // Pattern matching operation
        // Unary operations
        Factorial,
        Square,
        SquareRoot,
        Negate
    }

    public class Expression
    {
        public OperationType Operation { get; set; }
        public double FirstOperand { get; set; }
        public double SecondOperand { get; set; }
        public double Result { get; set; }
        public string ExpressionText { get; set; } = string.Empty; // Visual representation like "5 + 3 = 8"
        public DateTime ComputedTime { get; set; } = DateTime.UtcNow;
        
        public bool IsBinaryOperation => Operation is OperationType.Addition or OperationType.Subtraction or OperationType.Multiplication or OperationType.Division or OperationType.Regexp;
    }
}
