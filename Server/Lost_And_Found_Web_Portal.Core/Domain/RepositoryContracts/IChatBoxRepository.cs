using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using Lost_And_Found_Web_Portal.Core.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.RepositoryContracts
{
    public interface IChatBoxRepository
    {
        public Task AddMessage(Message message);
        public Task<Guid?> AddThread(Threads threads);
        public Task AddThreadMember(ThreadMembers threadMembers);
        public Task<Guid?> ExistThread(Guid user1, Guid user2);
        public Task<List<Message>> GetMessagesByThreadId(Guid threadGuid);
        public Task<List<Threads>?> GetThreadsByUserId(Guid id);
        public Task<string?> GetUserNameById(Guid id);
        public Task LastActivityUpdate(Guid threadId, DateTime presentTime);
    }
}
