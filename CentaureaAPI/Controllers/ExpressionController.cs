using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CentaureaAPI.Models;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;
using CentaureaAPI.Events;

namespace CentaureaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpressionController : ControllerBase
    {
        private readonly IExpressionService _expressionService;
        private readonly IEventQueue _eventQueue;

        public ExpressionController(
            IExpressionService expressionService,
            IEventQueue eventQueue)
        {
            _expressionService = expressionService;
            _eventQueue = eventQueue;
        }

        [HttpGet("samples", Name = "GetSampleExpressions")]
        public IEnumerable<Expression> GetSamples()
        {
            return _expressionService.GetExpressions();
        }

        [HttpPost("calculate", Name = "CalculateExpression")]
        public async Task<ActionResult<CalculateResponse>> Calculate([FromBody] CalculateRequest request)
        {
            int? userId = null;
            string? userEmail = null;

            string? userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdValue, out int parsedUserId))
            {
                userId = parsedUserId;
            }

            userEmail = User.FindFirstValue(ClaimTypes.Email);
            CalculateExpressionEvent calculateEvent = request.Operation switch
            {
                OperationType.Addition => new AdditionEvent(request.FirstOperand, request.SecondOperand, userId, userEmail),
                OperationType.Subtraction => new SubtractionEvent(request.FirstOperand, request.SecondOperand, userId, userEmail),
                OperationType.Multiplication => new MultiplicationEvent(request.FirstOperand, request.SecondOperand, userId, userEmail),
                OperationType.Division => new DivisionEvent(request.FirstOperand, request.SecondOperand, userId, userEmail),
                OperationType.Regexp => new RegexpEvent(request.Pattern!, request.Text!, userId, userEmail),
                OperationType.Factorial => new FactorialEvent(request.FirstOperand, userId, userEmail),
                OperationType.Square => new SquareEvent(request.FirstOperand, userId, userEmail),
                OperationType.SquareRoot => new SquareRootEvent(request.FirstOperand, userId, userEmail),
                OperationType.Negate => new NegateEvent(request.FirstOperand, userId, userEmail),
                _ => throw new InvalidOperationException($"Unknown operation: {request.Operation}")
            };

            await _eventQueue.EnqueueAwaitingAsync(calculateEvent, TimeSpan.FromSeconds(5));

            if (calculateEvent.Result == null)
            {
                return StatusCode(500, new { error = "Calculation failed to complete" });
            }

            CalculateResponse response = new CalculateResponse
            {
                Result = calculateEvent.Result
            };
            
            (int used, int remaining, int total)? usageInfo = calculateEvent.GetUsageInfo();
            if (usageInfo.HasValue)
            {
                response.RegexpUsage = new RegexpUsageInfo
                {
                    Used = usageInfo.Value.used,
                    Remaining = usageInfo.Value.remaining,
                    Total = usageInfo.Value.total
                };
            }

            return Ok(response);
        }

        [HttpGet("history", Name = "GetExpressionHistory")]
        public ActionResult<IEnumerable<ExpressionHistory>> GetHistory([FromQuery] int limit = 100)
        {
            IEnumerable<ExpressionHistory> history = _expressionService.GetHistory(limit);
            return Ok(history);
        }

        [HttpDelete("history", Name = "ClearExpressionHistory")]
        public ActionResult ClearHistory()
        {
            int count = _expressionService.ClearHistory();
            return Ok(new { message = $"Deleted {count} records from history" });
        }

        [HttpPut("history/{id:int}/computed-time", Name = "UpdateExpressionComputedTime")]
        public async Task<ActionResult<ExpressionHistory>> UpdateComputedTime(int id, [FromBody] UpdateComputedTimeRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { error = "Request body is required" });
            }

            DateTime normalized = request.ComputedTime.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(request.ComputedTime, DateTimeKind.Utc)
                : request.ComputedTime.ToUniversalTime();

            if (normalized > DateTime.UtcNow)
            {
                return BadRequest(new { error = "Computed time cannot be in the future" });
            }

            ExpressionHistory? updated = await _expressionService.UpdateHistoryComputedTimeAsync(id, normalized);

            if (updated == null)
            {
                return NotFound(new { error = "History record not found" });
            }

            return Ok(updated);
        }
    }

    public class CalculateRequest
    {
        public OperationType Operation { get; set; }
        public double FirstOperand { get; set; }
        public double SecondOperand { get; set; }
        public string? Pattern { get; set; }
        public string? Text { get; set; }
    }

    public class CalculateResponse
    {
        public Expression Result { get; set; } = null!;
        public RegexpUsageInfo? RegexpUsage { get; set; }
    }

    public class RegexpUsageInfo
    {
        public int Used { get; set; }
        public int Remaining { get; set; }
        public int Total { get; set; }
    }

    public class UpdateComputedTimeRequest
    {
        public DateTime ComputedTime { get; set; }
    }
}
