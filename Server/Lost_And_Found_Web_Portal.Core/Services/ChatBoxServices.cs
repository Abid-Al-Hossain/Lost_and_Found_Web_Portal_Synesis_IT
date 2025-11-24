using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using Lost_And_Found_Web_Portal.Core.Domain.IdentityEntities;
using Lost_And_Found_Web_Portal.Core.Domain.RepositoryContracts;
using Lost_And_Found_Web_Portal.Core.DTO;
using Lost_And_Found_Web_Portal.Core.Helpers;
using Lost_And_Found_Web_Portal.Core.ServiceContracts;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace Lost_And_Found_Web_Portal.Core.Services
{
    public class ChatBoxServices : IChatBoxServices
    {
        private readonly IChatBoxRepository _chatBoxRepository;
        private readonly ImageConverter _imageConverter;
        private readonly UserManager<ApplicationUser> _userManager;
        public ChatBoxServices(IChatBoxRepository chatBoxRepository, UserManager<ApplicationUser> userManager)
        {
            _chatBoxRepository = chatBoxRepository;
            _imageConverter = new ImageConverter();
            _userManager = userManager;
        }

        public async Task<MessageToShowDTO> AddMessage(MessageToAddDto messageDto, Guid id, string webRootPath)
        {
            Message message = messageDto.ToMessage();
            if(messageDto.base64stringImage!=null) message.ImagePath = await _imageConverter.SaveBase64ChatImageAsync(messageDto.base64stringImage, message.MessageId, webRootPath);
            message.SenderId = id;
            await _chatBoxRepository.AddMessage(message);

            MessageToShowDTO messageToShowDTO = message.ToMessageToShowDTO();
            messageToShowDTO.SenderName = await _chatBoxRepository.GetUserNameById(id);
            messageToShowDTO.base64stringImage = messageDto.base64stringImage;

            return messageToShowDTO;
        }

        public async Task<Guid?> ExistThread(Guid user1, Guid user2)
        {
            Guid? exist = await _chatBoxRepository.ExistThread(user1, user2);
            return exist;
        }

        public async Task<List<MessageToShowDTO>> GetMessagesByThreadId(Guid threadGuid, string webRootPath)
        {
            List<Message> messages = await _chatBoxRepository.GetMessagesByThreadId(threadGuid);
            List<MessageToShowDTO> messageToShowDTOs = new List<MessageToShowDTO>();
            
            foreach(Message message in messages)
            {
                MessageToShowDTO messageToShowDTO = message.ToMessageToShowDTO();
                
                if(message.ImagePath != null)
                {
                    messageToShowDTO.base64stringImage = await _imageConverter.ConvertImageToBase64Async(message.ImagePath, webRootPath, true);
                }
                
                ApplicationUser? user = await _userManager.FindByIdAsync(message.SenderId.ToString());
                if (user != null)
                {
                    messageToShowDTO.SenderName = user.PersonName;
                }
                
                messageToShowDTOs.Add(messageToShowDTO);    
            }
            
            return messageToShowDTOs;
        }

        public async Task<List<ThreadsToShowDTO>> GetSortedThreadsByUserId(Guid id)
        {
            List<Threads>? threads = await _chatBoxRepository.GetThreadsByUserId(id);
            List<ThreadsToShowDTO> threadsToShowDTOs = new List<ThreadsToShowDTO>();
            //ApplicationUser? user = await _userManager.FindByIdAsync(id.ToString());
            

            foreach (Threads thread in threads)
            {
                Guid otherUser = thread.ThreadMembers.FirstOrDefault(ThreadMembers => ThreadMembers.UserId != id) != null ? 
                    thread.ThreadMembers.FirstOrDefault(ThreadMembers => ThreadMembers.UserId != id).UserId 
                    : Guid.Empty;

                ApplicationUser? otherApplicationUser = await _userManager.FindByIdAsync(otherUser.ToString());

                ThreadsToShowDTO threadsToShowDTOx = new ThreadsToShowDTO();
                threadsToShowDTOx.ThreadId = thread.ThreadId;
                threadsToShowDTOx.ThreadName = otherApplicationUser != null ? otherApplicationUser.PersonName
                    : "Unknown User";
                threadsToShowDTOx.LastActivity = thread.LastActivity;
                
                threadsToShowDTOs.Add(threadsToShowDTOx);
            }

            threadsToShowDTOs = threadsToShowDTOs.OrderByDescending(t => t.LastActivity).ToList();
            return threadsToShowDTOs;
        }

        public async Task<Guid?> InitiatChatThread(Guid user1, Guid user2, string threadName)
        {
            Threads threads = new Threads();
            threads.ThreadId = Guid.NewGuid();
            threads.ThreadName = threadName;
            threads.CreatedAt = DateTime.UtcNow;
            threads.LastActivity = DateTime.UtcNow;
            Guid? createdThreadId = await _chatBoxRepository.AddThread(threads);


            ThreadMembers threadMembers1=new ThreadMembers();
            threadMembers1.Id=Guid.NewGuid();
            threadMembers1.ThreadId=threads.ThreadId;
            threadMembers1.UserId=user1;
            threadMembers1.JoinedAt=DateTime.UtcNow;
            threadMembers1.IsAdmin = false;
            await _chatBoxRepository.AddThreadMember(threadMembers1);

            ThreadMembers threadMembers2=new ThreadMembers();
            threadMembers2.Id=Guid.NewGuid();
            threadMembers2.ThreadId=threads.ThreadId;
            threadMembers2.UserId=user2;
            threadMembers2.JoinedAt=DateTime.UtcNow;
            threadMembers1.IsAdmin = false;
            await _chatBoxRepository.AddThreadMember(threadMembers2);

            return createdThreadId;
        }

        public async Task LastActivityUpdate(Guid threadId)
        {
            DateTime presentTime = DateTime.UtcNow;
            await _chatBoxRepository.LastActivityUpdate(threadId, presentTime);
        }
    }
}
