using System.Globalization;

namespace CentaureaAPI.Settings;

public class CultureSettings
{
    public string CultureCode { get; set; } = "en-US";
    internal CultureInfo GetCulture()
    {
        return new CultureInfo(CultureCode);
    }
}