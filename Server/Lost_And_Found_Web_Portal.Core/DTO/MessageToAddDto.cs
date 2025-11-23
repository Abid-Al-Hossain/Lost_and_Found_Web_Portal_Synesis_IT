using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using Lost_And_Found_Web_Portal.Core.Helpers;
using Microsoft.AspNetCore.Hosting;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.DTO
{
    public class MessageToAddDto
    {
        [Required]
        public Guid ThreadId { get; set; }

        [Required]
        public Guid SenderId { get; set; }

        public string? Text { get; set; }

        public string? base64stringImage { get; set; }

        public Message ToMessage()
        {
            return new Message
            {
                MessageId = Guid.NewGuid(),
                ThreadId = this.ThreadId,
                SenderId = this.SenderId,
                TextContent = this.Text,
                SentAt = DateTime.UtcNow,
                IsDeleted = false,
            };
        }
    }
}

