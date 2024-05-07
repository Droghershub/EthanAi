using BTO.Helper;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Resources;
using BTO.Service.Tracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Resources;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace BTO.Modules
{
    [Authorize]

    [ExceptionAPIFilterAttribute]
    [BTOActionFilter]
    public class BTOController : Controller
    {
        public ResourceManager rm = new ResourceManager("BTO.Resources.Resource", typeof(Resource).Assembly);
        public static int pageSizeDefault = 15;
        protected override IAsyncResult BeginExecuteCore(AsyncCallback callback, object state)
        {
            string cultureName = null;
            // Attempt to read the culture cookie from Request
            HttpCookie cultureCookie = Request.Cookies["_culture"];
            if (cultureCookie != null)
                cultureName = cultureCookie.Value;
            else
                cultureName = Request.UserLanguages != null && Request.UserLanguages.Length > 0 ? Request.UserLanguages[0] : null; // obtain it from HTTP header AcceptLanguages

            // Validate culture name
            cultureName = CultureHelper.GetImplementedCulture(cultureName); // This is safe 
            // Modify current thread's cultures            
            Thread.CurrentThread.CurrentCulture = new System.Globalization.CultureInfo(cultureName);
            Thread.CurrentThread.CurrentUICulture = Thread.CurrentThread.CurrentCulture;
            return base.BeginExecuteCore(callback, state);
        }
    }

}