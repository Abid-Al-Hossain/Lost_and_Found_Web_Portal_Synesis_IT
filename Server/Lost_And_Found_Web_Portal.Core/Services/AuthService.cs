using Lost_And_Found_Web_Portal.Core.Helpers;
using Lost_And_Found_Web_Portal.Core.ServiceContracts;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Services
{
    public class AuthService : IAuthService
    {
        private readonly TokenCreatorHelper _tokenCreatorHelper;
        private readonly IConfiguration _config;
        private readonly ITokenBlacklistRepository _tokenBlacklistRepository;
        public AuthService(IConfiguration config, ITokenBlacklistRepository tokenBlacklistRepository)
        {
            _config = config;
            _tokenCreatorHelper = new TokenCreatorHelper(_config);
            _tokenBlacklistRepository = tokenBlacklistRepository;
        }

        public async Task<bool> BlackListToken(string token)
        {
            try
            {
                _tokenBlacklistRepository.AddTokenToBlacklist(token);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public async Task<string> GetToken(string userEmail, List<string> roles)
        {
            return await _tokenCreatorHelper.CreateToken(userEmail, roles);
        }
    }
}
