using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Domain.Entities
{
    public class FoundItem
    {
        [Key]
        [Required]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(120)]
        public string? Type { get; set; }           

        [MaxLength(80)]
        [Required]
        public string? Brand { get; set; }

        [MaxLength(40)]
        [Required]
        public string? Color { get; set; }
         

        [MaxLength(200)]
        [Required]
        public string? Place { get; set; }       

        [Column(TypeName = "date")]
        [Required]
        public DateTime? FoundDate { get; set; }

        [MaxLength(500)]
        public string? Detail { get; set; }


        [Column(TypeName = "decimal(9,6)")]
        [Required]
        public decimal? Latitude { get; set; }


        [Column(TypeName = "decimal(9,6)")]
        [Required]
        public decimal? Longitude { get; set; }


    
        [Required, MaxLength(32)]
        public string Status { get; set; } = "Pending";

        [Required]
        public Guid? OwnerId { get; set; }

        [MaxLength(200)]
        [Required]
        public string? OwnerName { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
