using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CentaureaAPI.Models;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;

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

        [Authorize]
        [HttpPost("calculate", Name = "CalculateExpression")]
        public ActionResult<Expression> Calculate([FromBody] CalculateRequest request)
        {
            if (request.Operation == OperationType.Division && request.SecondOperand == 0)
            {
                return BadRequest(new { error = "Cannot divide by zero" });
            }

            Expression expression = _expressionService.CalculateExpression(
                request.Operation,
                request.FirstOperand,
                request.SecondOperand);
            
            int? userId = null;
            string? userEmail = null;

            string? userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdValue, out int parsedUserId))
            {
                userId = parsedUserId;
            }

            userEmail = User.FindFirstValue(ClaimTypes.Email);

            StoreExpressionHistoryEvent storeEvent = new StoreExpressionHistoryEvent(expression, userId, userEmail);
            _eventQueue.Enqueue(storeEvent);
            
            return Ok(expression);
        }

        [Authorize]
        [HttpGet("history", Name = "GetExpressionHistory")]
        public ActionResult<IEnumerable<ExpressionHistory>> GetHistory([FromQuery] int limit = 100)
        {
            IEnumerable<ExpressionHistory> history = _expressionService.GetHistory(limit);
            return Ok(history);
        }

        [Authorize]
        [HttpDelete("history", Name = "ClearExpressionHistory")]
        public ActionResult ClearHistory()
        {
            int count = _expressionService.ClearHistory();
            return Ok(new { message = $"Deleted {count} records from history" });
        }
    }

    public class CalculateRequest
    {
        public OperationType Operation { get; set; }
        public double FirstOperand { get; set; }
        public double SecondOperand { get; set; }
    }
}
