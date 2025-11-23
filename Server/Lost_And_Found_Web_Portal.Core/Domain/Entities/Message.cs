using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.Entities
{
    public class Message
    {
        [Required]
        [Key]
        public Guid MessageId { get; set; }
        [Required]
        public Guid ThreadId { get; set; }
        [Required]
        public Guid SenderId { get; set; }
        public string? TextContent { get; set; }
        public string? ImagePath { get; set; }

        [Required]
        public DateTime SentAt { get; set; }

        [Required]
        [Column(TypeName = "bit")]
        public bool IsDeleted { get; set; } = false;
    }
}
