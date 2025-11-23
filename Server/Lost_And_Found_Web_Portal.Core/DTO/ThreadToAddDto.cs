using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Versioning;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.DTO
{
    public class ThreadToAddDto
    {
        [Required]
        public Guid ThreadID { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string? ThreadName { get; set; }


        [Required]
        public Guid User2 { get; set; }
    }
}
