using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.Entities
{
    public class ThreadMembers
    {
        [Required]
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ThreadId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public DateTime JoinedAt { get; set; }

        [Required]
        [Column(TypeName = "bit")]
        public bool IsAdmin { get; set; } = false;

        [ForeignKey("ThreadId")]
        public Threads? Thread { get; set; }

    }
}
