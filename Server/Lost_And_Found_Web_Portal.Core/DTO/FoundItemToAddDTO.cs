using Lost_And_Found_Web_Portal.Core.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.DTO
{
    public class FoundItemToAddDTO
    {
        [Required, MaxLength(120)]
        public string? Type { get; set; }

        [MaxLength(200)]
        [Required]
        public string? Place { get; set; }

        [Required]
        public DateTime? FoundDate { get; set; }


        [MaxLength(80)]
        [Required]
        public string? Brand { get; set; }

        [MaxLength(40)]
        [Required]
        public string? Color { get; set; }

        [MaxLength(500)]
        [Required]
        public string? Detail { get; set; }

        [Required]
        public decimal? Latitude { get; set; }
        [Required]
        public decimal? Longitude { get; set; }


        public FoundItem ToFoundItem()
        {
            return new FoundItem
            {
                Type = this.Type,
                Place = this.Place,
                FoundDate = this.FoundDate,
                Brand = this.Brand,
                Color = this.Color,
                Detail = this.Detail,
                Latitude = this.Latitude,
                Longitude = this.Longitude,
                Status = "Pending",
                CreatedAt= DateTime.UtcNow,
                UpdatedAt = null

            };
        }
    }
}
