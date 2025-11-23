using Lost_And_Found_Web_Portal.Core.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.ServiceContracts
{
    public interface IChatBoxServices
    {
        public Task<MessageToShowDTO> AddMessage(MessageToAddDto messageDto, Guid id, string webRootPath);
        public Task<Guid?> ExistThread(Guid id, Guid user2);
        public Task<List<MessageToShowDTO>> GetMessagesByThreadId(Guid threadGuid, string webRootPath);
        public Task<List<ThreadsToShowDTO>> GetSortedThreadsByUserId(Guid id);
        public Task<Guid?> InitiatChatThread(Guid id, Guid user2,string threadName);
        public Task LastActivityUpdate(Guid threadId);
    }
}
