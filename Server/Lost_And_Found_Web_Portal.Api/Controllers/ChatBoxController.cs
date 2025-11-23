using Lost_And_Found_Web_Portal.Core.Domain.IdentityEntities;
using Lost_And_Found_Web_Portal.Core.DTO;
using Lost_And_Found_Web_Portal.Core.ServiceContracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Lost_And_Found_Web_Portal.Api.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    [Authorize(Roles = "Admin,User")]
    public class ChatBoxController : ControllerBase
    {
        private readonly ILogger<ChatBoxController> _logger;
        private readonly IChatBoxServices _chatBoxServices;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _webHostEnvironment;
        public ChatBoxController(ILogger<ChatBoxController> logger, IChatBoxServices chatBoxServices, UserManager<ApplicationUser> userManager, IWebHostEnvironment webHostEnvironment)
        {
            _logger = logger;
            _chatBoxServices = chatBoxServices;
            _userManager = userManager;
            _webHostEnvironment = webHostEnvironment;
        }


        [HttpPost]
        public async Task<IActionResult> InitiatChatThread(ThreadToAddDto threadToAddDto)
        {
            var email = User.FindFirst("userEmail")?.Value
                 ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            ApplicationUser? user = await _userManager.FindByEmailAsync(email);

            if(user.Id==threadToAddDto.User2)
            {
                return BadRequest("You can't chat with yourself");
            }

            Guid? threadId = await _chatBoxServices.ExistThread(user.Id,threadToAddDto.User2);
            
            if(threadId != null)
            {
                return Ok(threadId);
            }
            
            threadId = await _chatBoxServices.InitiatChatThread(user.Id, threadToAddDto.User2,threadToAddDto.ThreadName);

            return Ok(threadId);
        }


        [HttpGet]
        public async Task<IActionResult> GetSortedThreads()
        {
            var email = User.FindFirst("userEmail")?.Value
                 ?? User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            ApplicationUser? user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return BadRequest("Login First");
            }

            List<ThreadsToShowDTO> threadToShowDTOs = await _chatBoxServices.GetSortedThreadsByUserId(user.Id);
            return Ok(new { threadToShowDTOs, user.Id });
        }


    }
}
