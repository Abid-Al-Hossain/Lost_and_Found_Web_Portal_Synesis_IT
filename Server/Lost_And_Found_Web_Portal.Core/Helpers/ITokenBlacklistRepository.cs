public interface ITokenBlacklistRepository
{
    void AddTokenToBlacklist(string token);
    bool IsTokenBlacklisted(string token);
}

public class TokenBlacklistRepository : ITokenBlacklistRepository
{
    private readonly HashSet<string> _blacklistedTokens = new HashSet<string>();

    public void AddTokenToBlacklist(string token)
    {
        _blacklistedTokens.Add(token);
    }

    public bool IsTokenBlacklisted(string token)
    {
        return _blacklistedTokens.Contains(token);
    }
}