using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Lost_And_Found_Web_Portal.Core.Helpers
{
    public class TokenCreatorHelper
    {
        private readonly IConfiguration _config;
        public TokenCreatorHelper(IConfiguration config)
        {
            _config = config;
        }

        public async Task<string> CreateToken(string userEmail, List<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim("userEmail", userEmail)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("role", role));
            }

            var tokenKey = _config.GetSection("AppSettings:TokenKey").Value;
            if (string.IsNullOrEmpty(tokenKey))
            {
                throw new InvalidOperationException("TokenKey is not configured in the app settings.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(descriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
