using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using Lost_And_Found_Web_Portal.Core.Domain.RepositoryContracts;
using Lost_And_Found_Web_Portal.Core.DTO;
using Lost_And_Found_Web_Portal.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Infrastructure.Repositories
{
    public class LostAndFoundRepository : ILostAndFoundRepository
    {
        private readonly ApplicationDbContext _dbContext;
        public LostAndFoundRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }


        public Task AddLostItem(LostItem lostItem)
        {
            try
            {
                _dbContext.LostItems.Add(lostItem);
                _dbContext.SaveChanges();
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to add lost item to the database: {ex.Message}", ex);
            }
        }

        public List<LostItem> GetAllLostItems()
        {
            return _dbContext.LostItems.Where(x=>x.Status== "Pending").ToList();
        }

        public List<LostItem> GetLostItemsById(Guid id)
        {
            return _dbContext.LostItems
                .Where(x => x.OwnerId == id).ToList();
        }


        public Task AddFoundItemAsync(FoundItem foundItem)
        {
            _dbContext.FoundItems.AddAsync(foundItem).AsTask();
            _dbContext.SaveChanges();
            return Task.CompletedTask;
        }

        public async Task<List<FoundItem>> GetAllFoundItems()
        {
            return _dbContext.FoundItems.Where(x=>x.Status=="Pending").ToList();
        }

        public Task<List<FoundItem>> GetFoundItemsById(Guid id)
        {
            return Task.FromResult(_dbContext.FoundItems
                .Where(x => x.OwnerId == id).ToList());
        }

        public async Task<List<Notification>> GetNotification(NotificationToAddDTO notificationToAddDTO)
        {
            return _dbContext.Notifications
                .Where(n => n.FoundItemId == notificationToAddDTO.FoundItemId && n.NotificationReceiver == notificationToAddDTO.NotificationReceiver)
                .ToList();
        }

        public async Task AddNotification(Notification notification)
        {
            await _dbContext.Notifications.AddAsync(notification);
            _dbContext.SaveChanges();
        }

        public async Task<List<Notification>> GetNotificationsByUserId(Guid id)
        {
            return await _dbContext.Notifications.Where(x=> x.NotificationReceiver == id).ToListAsync();
        }

        public async Task InvertNotificationAsRead(Guid notificationId)
        {
            Notification notification = await _dbContext.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = !notification.IsRead;
                _dbContext.SaveChanges();
            }
        }

        public async Task PendingStatus(Guid lostPostId)
        {
            await _dbContext.LostItems.Where(x => x.Id == lostPostId)
                .ForEachAsync(x => x.Status = "Pending");
            _dbContext.SaveChanges();
        }

        public async Task ResolveStatus(Guid lostPostId)
        {
            await _dbContext.LostItems.Where(x => x.Id == lostPostId)
                .ForEachAsync(x => x.Status = "Resolved");
            _dbContext.SaveChanges();
        }

        public async Task PendingFoundStatus(Guid lostPostId)
        {
            await _dbContext.FoundItems.Where(x => x.Id == lostPostId)
                .ForEachAsync(x => x.Status = "Pending");
            _dbContext.SaveChanges();
        }

        public async Task ResolveFoundStatus(Guid lostPostId)
        {
            await _dbContext.FoundItems.Where(x => x.Id == lostPostId)
                .ForEachAsync(x => x.Status = "Resolved");
            _dbContext.SaveChanges();
        }

        public async Task<int> GetUnreadNotificationCount(Guid id)
        {
            return await _dbContext.Notifications
                .Where(n => n.NotificationReceiver == id && n.IsRead == false)
                .CountAsync();
        }
    }
}
