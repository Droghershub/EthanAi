using BTO.Common;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Service.Tracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Routing;

namespace BTO.Modules
{
    public class BTOAPIActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                client.time_update = DateTime.Now;
                HttpContext.Current.Session["ProfileSession"] = client;
            }
            if (HttpContext.Current.Session["Lastest_Access_Time"] == null)
            {
                actionExecutedContext.Response = actionExecutedContext.Request.CreateErrorResponse(HttpStatusCode.RequestTimeout, new TimeoutException());
            }
            else
            {
                DateTime before_time = (DateTime)HttpContext.Current.Session["Lastest_Access_Time"];
                if ((DateTime.Now - (DateTime)before_time).TotalMinutes >= 30)
                {
                    //actionExecutedContext.Response = actionExecutedContext.Request.CreateErrorResponse(HttpStatusCode.RequestTimeout, new TimeoutException());
                    actionExecutedContext.Response = actionExecutedContext.Request.CreateResponse(HttpStatusCode.RequestTimeout, "BTOAPIActionFilter");
                }
                else
                {
                    if (!actionExecutedContext.Request.RequestUri.AbsolutePath.Contains("SaveAutomatic") && !actionExecutedContext.Request.RequestUri.AbsolutePath.Contains("get_timeout"))
                        HttpContext.Current.Session["Lastest_Access_Time"] = DateTime.Now;
                }
            }           
         
        }

    }

}