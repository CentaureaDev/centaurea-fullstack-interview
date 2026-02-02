namespace CentaureaAPI.Models
{
    public enum OperationType
    {
        Addition,
        Subtraction,
        Multiplication,
        Division
    }

    public class Expression
    {
        public OperationType Operation { get; set; }
        public double FirstOperand { get; set; }
        public double SecondOperand { get; set; }
        public double Result
        {
            get
            {
                return Operation switch
                {
                    OperationType.Addition => FirstOperand + SecondOperand,
                    OperationType.Subtraction => FirstOperand - SecondOperand,
                    OperationType.Multiplication => FirstOperand * SecondOperand,
                    OperationType.Division => SecondOperand != 0 ? FirstOperand / SecondOperand : double.NaN,
                    _ => double.NaN
                };
            }
        }

        public string OperationSymbol
        {
            get
            {
                return Operation switch
                {
                    OperationType.Addition => "+",
                    OperationType.Subtraction => "-",
                    OperationType.Multiplication => "*",
                    OperationType.Division => "/",
                    _ => "?"
                };
            }
        }

        public string ExpressionString => $"{FirstOperand} {OperationSymbol} {SecondOperand} = {Result}";
    }
}
