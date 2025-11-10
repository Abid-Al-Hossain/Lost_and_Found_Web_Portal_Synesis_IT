using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.RepositoryContracts
{
    public interface ILostAndFoundRepository
    {
        public Task AddFoundItemAsync(FoundItem foundItem);
        public Task AddLostItem(LostItem lostItem);
        public Task<List<FoundItem>> GetAllFoundItems();
        public List<LostItem> GetAllLostItems();
        public Task<List<FoundItem>> GetFoundItemsById(Guid id);
        public List<LostItem> GetLostItemsById(Guid email);
    }
}
