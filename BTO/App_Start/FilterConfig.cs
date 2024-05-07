using BTO.Modules;
using System.Web;
using System.Web.Mvc;

namespace BTO
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        //    filters.Add(new BTOActionFilter());
        }
    }
}
