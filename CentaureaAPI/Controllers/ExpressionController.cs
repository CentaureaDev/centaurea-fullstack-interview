using Microsoft.AspNetCore.Mvc;
using CentaureaAPI.Models;
using CentaureaAPI.Services;
using CentaureaAPI.Infrastructure;

namespace CentaureaAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpressionController : ControllerBase
    {
        private readonly ILogger<ExpressionController> _logger;
        private readonly IExpressionService _expressionService;
        private readonly IEventQueue _eventQueue;

        public ExpressionController(
            ILogger<ExpressionController> logger, 
            IExpressionService expressionService,
            IEventQueue eventQueue)
        {
            _logger = logger;
            _expressionService = expressionService;
            _eventQueue = eventQueue;
        }

        [HttpGet("samples", Name = "GetSampleExpressions")]
        public IEnumerable<Expression> GetSamples()
        {
            return _expressionService.GetExpressions();
        }

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
            
            // Get user identifier from headers or use IP address
            string? userIdentifier = Request.Headers["X-User-Id"].FirstOrDefault() 
                ?? HttpContext.Connection.RemoteIpAddress?.ToString();
            
            StoreExpressionHistoryEvent storeEvent = new StoreExpressionHistoryEvent(expression, userIdentifier);
            _eventQueue.Enqueue(storeEvent);
            
            return Ok(expression);
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
    }

    public class CalculateRequest
    {
        public OperationType Operation { get; set; }
        public double FirstOperand { get; set; }
        public double SecondOperand { get; set; }
    }
}
