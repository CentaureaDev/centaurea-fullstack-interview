namespace CentaureaAPI.Models
{
    public enum OperationType
    {
        // Binary operations
        Addition,
        Subtraction,
        Multiplication,
        Division,
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
        
        public bool IsBinaryOperation => Operation is OperationType.Addition or OperationType.Subtraction or OperationType.Multiplication or OperationType.Division;
    }
}
