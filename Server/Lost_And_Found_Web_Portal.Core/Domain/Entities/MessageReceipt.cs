using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.Entities
{
    public class MessageReceipt
    {
        [Required]
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid MessageId { get; set; }

        [Required]
        public Guid RecipientId { get; set; }

        [Required]
        public DateTime ReadAt { get; set; }
    }
}
