using CentaureaAPI.Models;
using System.Text.RegularExpressions;

namespace CentaureaAPI.Services
{
    /// <summary>
    /// Base interface for calculation strategies
    /// </summary>
    public interface ICalculationStrategy
    {
        OperationType OperationType { get; }
        double Calculate(double firstOperand, double secondOperand = 0);
        string GenerateExpressionText(double firstOperand, double secondOperand, double result);
    }

    /// <summary>
    /// Addition strategy: a + b
    /// </summary>
    public class AdditionStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Addition;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            return firstOperand + secondOperand;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            return $"{firstOperand} + {secondOperand} = {result}";
        }
    }

    /// <summary>
    /// Subtraction strategy: a - b
    /// </summary>
    public class SubtractionStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Subtraction;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            return firstOperand - secondOperand;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            return $"{firstOperand} - {secondOperand} = {result}";
        }
    }

    /// <summary>
    /// Multiplication strategy: a * b
    /// </summary>
    public class MultiplicationStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Multiplication;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            return firstOperand * secondOperand;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            return $"{firstOperand} * {secondOperand} = {result}";
        }
    }

    /// <summary>
    /// Division strategy: a / b
    /// </summary>
    public class DivisionStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Division;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            if (secondOperand == 0)
                return double.NaN;
            return firstOperand / secondOperand;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            if (double.IsNaN(result))
                return $"{firstOperand} / {secondOperand} = undefined (division by zero)";
            return $"{firstOperand} / {secondOperand} = {result}";
        }
    }

    /// <summary>
    /// Factorial strategy: n!
    /// </summary>
    public class FactorialStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Factorial;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            if (firstOperand < 0 || firstOperand != Math.Floor(firstOperand))
                return double.NaN;

            if (firstOperand > 170) // Prevent overflow
                return double.PositiveInfinity;

            int n = (int)firstOperand;
            double result = 1;
            for (int i = 2; i <= n; i++)
                result *= i;
            return result;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            if (double.IsNaN(result))
                return $"{firstOperand}! = undefined (must be non-negative integer)";
            if (double.IsInfinity(result))
                return $"{firstOperand}! = infinity (overflow)";
            return $"{firstOperand}! = {result}";
        }
    }

    /// <summary>
    /// Square strategy: a²
    /// </summary>
    public class SquareStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Square;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            return firstOperand * firstOperand;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            return $"{firstOperand}² = {result}";
        }
    }

    /// <summary>
    /// Square root strategy: √a
    /// </summary>
    public class SquareRootStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.SquareRoot;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            if (firstOperand < 0)
                return double.NaN;
            return Math.Sqrt(firstOperand);
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            if (double.IsNaN(result))
                return $"√{firstOperand} = undefined (negative number)";
            return $"√{firstOperand} = {result}";
        }
    }

    /// <summary>
    /// Negate strategy: -a
    /// </summary>
    public class NegateStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Negate;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            return -firstOperand;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            return $"-({firstOperand}) = {result}";
        }
    }

    /// <summary>
    /// Regexp strategy: counts pattern matches in text
    /// FirstOperand encodes the pattern as a double representation
    /// SecondOperand encodes the text as a double representation
    /// Result is the count of matches
    /// Note: This is a demonstration - in production, you'd want a proper string-based API
    /// </summary>
    public class RegexpStrategy : ICalculationStrategy
    {
        public OperationType OperationType => OperationType.Regexp;

        public double Calculate(double firstOperand, double secondOperand = 0)
        {
            // For regexp, we expect special handling at the controller level
            // This should not be called with actual numbers
            return 0;
        }

        public string GenerateExpressionText(double firstOperand, double secondOperand, double result)
        {
            return $"Regexp matches: {result}";
        }

        // Special method for regexp calculation with strings
        public static (double result, string expressionText) CalculateRegexp(string pattern, string text)
        {
            try
            {
                var regex = new Regex(pattern, RegexOptions.None, TimeSpan.FromSeconds(1));
                var matches = regex.Matches(text);
                var count = matches.Count;
                return (count, $"Pattern '{pattern}' matched {count} time(s) in text");
            }
            catch (RegexMatchTimeoutException)
            {
                return (double.NaN, $"Pattern '{pattern}' timed out");
            }
            catch (ArgumentException)
            {
                return (double.NaN, $"Invalid regex pattern: '{pattern}'");
            }
        }
    }
}
