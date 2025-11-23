using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using Lost_And_Found_Web_Portal.Core.Domain.IdentityEntities;
using Lost_And_Found_Web_Portal.Core.ServiceContracts;
using Lost_And_Found_Web_Portal.Core.DTO;
using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using Lost_And_Found_Web_Portal.Core.Helpers;
using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Lost_And_Found_Web_Portal.Api.Hubs
{
    [Authorize(Roles = "Admin,User")]
    public class ChatHub : Hub
    {
        private readonly IChatBoxServices _chatBoxServices;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ImageConverter _imageConverter;

        public ChatHub(IChatBoxServices chatBoxServices, UserManager<ApplicationUser> userManager, IWebHostEnvironment webHostEnvironment)
        {
            _chatBoxServices = chatBoxServices;
            _userManager = userManager;
            _webHostEnvironment = webHostEnvironment;
            _imageConverter = new ImageConverter();
        }

        public async Task JoinThread(string threadId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, threadId);
            await Clients.Group(threadId).SendAsync("UserJoined", Context.User?.Identity?.Name ?? "Unknown User");
        }

        public async Task LeaveThread(string threadId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, threadId);
            await Clients.Group(threadId).SendAsync("UserLeft", Context.User?.Identity?.Name ?? "Unknown User");
        }


        public async Task GetMessages(string threadId)
        {
            try
            {
                if (!Guid.TryParse(threadId, out Guid threadGuid))
                {
                    await Clients.Caller.SendAsync("Error", "Invalid thread ID");
                    return;
                }

                string webRootPath = _webHostEnvironment.WebRootPath;
                List<MessageToShowDTO> messages = await _chatBoxServices.GetMessagesByThreadId(threadGuid, webRootPath);
                //messages.OrderBy(t => t.SentAt);

                await Clients.Caller.SendAsync("MessagesLoaded",threadGuid, messages);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to load messages: {ex.Message}");
            }
        }


        public async Task SendMessage(MessageToAddDto messageDto)
        {
            try
            {
                var email = Context.User?.FindFirst("userEmail")?.Value 
                    ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value;
                
                if (string.IsNullOrEmpty(email))
                {
                    await Clients.Caller.SendAsync("Error", "User not authenticated");
                    return;
                }

                ApplicationUser? user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    await Clients.Caller.SendAsync("Error", "User not found");
                    return;
                }
                string webRootPath = _webHostEnvironment.WebRootPath;
                MessageToShowDTO messageToShowDTO = await _chatBoxServices.AddMessage(messageDto, user.Id, webRootPath);
                await _chatBoxServices.LastActivityUpdate(messageDto.ThreadId);

                await Clients.Group(messageDto.ThreadId.ToString()).SendAsync("ReceiveMessage", messageToShowDTO);
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to send message: {ex.Message}");
            }
        }


        public async Task InitiateChat(Guid targetUserId, string threadName)
        {
            try
            {
                var email = Context.User?.FindFirst("userEmail")?.Value 
                    ?? Context.User?.FindFirst(ClaimTypes.Email)?.Value;
                
                if (string.IsNullOrEmpty(email))
                {
                    await Clients.Caller.SendAsync("Error", "User not authenticated");
                    return;
                }

                ApplicationUser? user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    await Clients.Caller.SendAsync("Error", "User not found");
                    return;
                }

                if(user.Id==targetUserId)
                {
                    await Clients.Caller.SendAsync("Error", "You can't chat with yourself");
                    return;
                }

                threadName = threadName.Split(' ')[0] + " X " + (user.PersonName?.Split(' ')[0] ?? "Unknown");

                Guid? existingThreadId = await _chatBoxServices.ExistThread(user.Id, targetUserId);
                
                if (existingThreadId.HasValue)
                {
                    await Clients.Caller.SendAsync("ThreadExists", existingThreadId.Value);
                    return;
                }

                Guid? newThreadId = await _chatBoxServices.InitiatChatThread(user.Id, targetUserId, threadName);
                
                if (newThreadId.HasValue)
                {
                    await Clients.Caller.SendAsync("ThreadCreated", newThreadId.Value);
                    
                    var targetUser = await _userManager.FindByIdAsync(targetUserId.ToString());

                    if (targetUser != null)
                    {
                        await Clients.User(targetUser.Id.ToString()).SendAsync("NewThreadNotification", new
                        {
                            ThreadId = newThreadId.Value,
                            ThreadName = threadName,
                            InitiatorName = user.PersonName ?? user.UserName ?? "Unknown User"
                        });
                    }
                }
                else
                {
                    await Clients.Caller.SendAsync("Error", "Failed to create thread");
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", $"Failed to initiate chat: {ex.Message}");
            }
        }


        public async Task UserTyping(string threadId)
        {
            var userName = Context.User?.Identity?.Name ?? "Unknown User";
            await Clients.OthersInGroup(threadId).SendAsync("UserTyping", userName);
        }


        public async Task UserStoppedTyping(string threadId)
        {
            var userName = Context.User?.Identity?.Name ?? "Unknown User";
            await Clients.OthersInGroup(threadId).SendAsync("UserStoppedTyping", userName);
        }


        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnConnectedAsync();
        }


        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
            }
            await base.OnDisconnectedAsync(exception);
        }

    }
}