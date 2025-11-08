using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Lost_And_Found_Web_Portal.Api.Filters
{
    public class ModelStateHandleFilter : IAsyncActionFilter
    {
        private readonly ILogger<ModelStateHandleFilter> _logger;

        public ModelStateHandleFilter(ILogger<ModelStateHandleFilter> logger)
        {
            _logger = logger;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (!context.ModelState.IsValid)
            {
                List<string> errors = context.ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                _logger.LogWarning("Model state is invalid: {Errors}", string.Join(", ", errors));
                context.Result = new BadRequestObjectResult(new { Errors = errors });
                return; // Don't call next() when model state is invalid
            }

            await next(); // Continue to action execution if model state is valid
        }
    }
}