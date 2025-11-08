using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.ServiceContracts
{
    public interface IAuthService
    {
        public Task<string> GetToken(string userEmail, List<string> roles);
        public Task<bool> BlackListToken(string token);
    }
}
