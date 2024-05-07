using BTO.Model.Tracking;
using BTO.Models;
using BTO.Service.Tracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace BTO.Modules
{
    public class BTOActionFilter : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (HttpContext.Current.Session["ProfileSession"] == null)
            {
                HttpContext.Current.GetOwinContext().Authentication.SignOut();
                return false;
            }
            return base.AuthorizeCore(httpContext);
        }
       
    }
}