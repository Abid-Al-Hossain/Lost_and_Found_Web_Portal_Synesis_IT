
namespace Lost_And_Found_Web_Portal.Api.Middleware
{
    public class TokenBlacklistMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ITokenBlacklistRepository _tokenBlacklistRepository;

        public TokenBlacklistMiddleware(RequestDelegate next, ITokenBlacklistRepository tokenBlacklistRepository)
        {
            _next = next;
            _tokenBlacklistRepository = tokenBlacklistRepository;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (token != null && _tokenBlacklistRepository.IsTokenBlacklisted(token))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Token is blacklisted");
                return;
            }

            await _next(context);
        }
    }
}
