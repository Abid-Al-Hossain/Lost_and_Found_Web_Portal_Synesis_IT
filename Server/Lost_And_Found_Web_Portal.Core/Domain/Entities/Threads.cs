using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.Entities
{
    public class Threads
    {
        [Required]
        [Key]
        public Guid ThreadId { get; set; }

        [Required]
        [MaxLength(100)]
        public string? ThreadName { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [Required]
        public DateTime LastActivity{ get; set; }

        public ICollection<ThreadMembers>? ThreadMembers { get; set; }
    }
}
