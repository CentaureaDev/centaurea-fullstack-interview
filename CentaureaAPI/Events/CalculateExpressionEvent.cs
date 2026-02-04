using CentaureaAPI.Models;

namespace CentaureaAPI.Events
{
    /// <summary>
    /// Base event for expression calculations.
    /// Specific operation events inherit from this.
    /// </summary>
    public abstract class CalculateExpressionEvent : BackgroundEvent
    {
        public double FirstOperand { get; protected set; }
        public double SecondOperand { get; protected set; }
        public int? UserId { get; protected set; }
        public string? UserEmail { get; protected set; }
        public Expression? Result { get; set; }

        protected CalculateExpressionEvent(
            double firstOperand,
            double secondOperand,
            int? userId,
            string? userEmail)
        {
            FirstOperand = firstOperand;
            SecondOperand = secondOperand;
            UserId = userId;
            UserEmail = userEmail;
        }

        protected CalculateExpressionEvent(
            double firstOperand,
            double secondOperand,
            int? userId,
            string? userEmail,
            DateTime startTime) : base(startTime)
        {
            FirstOperand = firstOperand;
            SecondOperand = secondOperand;
            UserId = userId;
            UserEmail = userEmail;
        }

        public abstract OperationType OperationType { get; }
    }

    // Binary operation events
    public class AdditionEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Addition;

        public AdditionEvent(double firstOperand, double secondOperand, int? userId, string? userEmail)
            : base(firstOperand, secondOperand, userId, userEmail) { }

        public AdditionEvent(double firstOperand, double secondOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, secondOperand, userId, userEmail, startTime) { }
    }

    public class SubtractionEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Subtraction;

        public SubtractionEvent(double firstOperand, double secondOperand, int? userId, string? userEmail)
            : base(firstOperand, secondOperand, userId, userEmail) { }

        public SubtractionEvent(double firstOperand, double secondOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, secondOperand, userId, userEmail, startTime) { }
    }

    public class MultiplicationEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Multiplication;

        public MultiplicationEvent(double firstOperand, double secondOperand, int? userId, string? userEmail)
            : base(firstOperand, secondOperand, userId, userEmail) { }

        public MultiplicationEvent(double firstOperand, double secondOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, secondOperand, userId, userEmail, startTime) { }
    }

    public class DivisionEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Division;

        public DivisionEvent(double firstOperand, double secondOperand, int? userId, string? userEmail)
            : base(firstOperand, secondOperand, userId, userEmail) { }

        public DivisionEvent(double firstOperand, double secondOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, secondOperand, userId, userEmail, startTime) { }
    }

    // Unary operation events
    public class FactorialEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Factorial;

        public FactorialEvent(double firstOperand, int? userId, string? userEmail)
            : base(firstOperand, 0, userId, userEmail) { }

        public FactorialEvent(double firstOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, 0, userId, userEmail, startTime) { }
    }

    public class SquareEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Square;

        public SquareEvent(double firstOperand, int? userId, string? userEmail)
            : base(firstOperand, 0, userId, userEmail) { }

        public SquareEvent(double firstOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, 0, userId, userEmail, startTime) { }
    }

    public class SquareRootEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.SquareRoot;

        public SquareRootEvent(double firstOperand, int? userId, string? userEmail)
            : base(firstOperand, 0, userId, userEmail) { }

        public SquareRootEvent(double firstOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, 0, userId, userEmail, startTime) { }
    }

    public class NegateEvent : CalculateExpressionEvent
    {
        public override OperationType OperationType => OperationType.Negate;

        public NegateEvent(double firstOperand, int? userId, string? userEmail)
            : base(firstOperand, 0, userId, userEmail) { }

        public NegateEvent(double firstOperand, int? userId, string? userEmail, DateTime startTime)
            : base(firstOperand, 0, userId, userEmail, startTime) { }
    }
}

