using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using BTO.Model.Tracking;
namespace BTO.Modules
{
    public class BTOAPIAuthorizeAttribute : AuthorizeAttribute
    {
        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
            {
                base.HandleUnauthorizedRequest(actionContext);
            }
            else
            {
                base.OnAuthorization(actionContext);
            }
            
        }
    }
}