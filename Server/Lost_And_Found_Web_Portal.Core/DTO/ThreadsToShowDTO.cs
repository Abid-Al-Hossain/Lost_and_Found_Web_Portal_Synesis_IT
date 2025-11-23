using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.DTO
{
    public class ThreadsToShowDTO
    {
        public Guid ThreadId { get; set; }
        public string? ThreadName { get; set; }
        public DateTime LastActivity { get; set; }
    }
}
