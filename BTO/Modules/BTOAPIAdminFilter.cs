using Microsoft.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Filters;
using System.Configuration;
using BTO.Models;
using System.Web.Http.Controllers;
using System.Net.Http.Formatting;

namespace BTO.Modules
{
    public class CustomActionResult
    {
        public string Message { get; set; }
    }
    public class BTOAPIAdminFilter : ActionFilterAttribute
    { 

        public override void OnActionExecuting(HttpActionContext actionExecutedContext)
        {
           string ip = this.GetClientIpAddress(actionExecutedContext.Request);
           string listIPAccepted = Ultils.GetValueByKeyFromConfig("ListAcceptedIP");
           if(!String.IsNullOrEmpty(listIPAccepted))
           {
               if (listIPAccepted.Split(',').Where(t => t.Equals(ip)).Count() == 0)
               {
                   //Common.Mail.Send(
                   //"quang.pham@axonactive.vn",
                   //"Your IP Adress is not allow!",
                   // "ip: " + ip + " <br /> listIPAccepted:" + listIPAccepted
                   // );
                   actionExecutedContext.Response =
                    actionExecutedContext.Request.CreateResponse(
                    HttpStatusCode.MethodNotAllowed,
                    new { Message = "This ("+ ip +") IP Adress is not allow!" },
                    JsonMediaTypeFormatter.DefaultMediaType
                );
               }
           }
        }
        public string GetClientIpAddress(HttpRequestMessage request)
        {
            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                return IPAddress.Parse(((HttpContextBase)request.Properties["MS_HttpContext"]).Request.UserHostAddress).ToString();
            }
            if (request.Properties.ContainsKey("MS_OwinContext"))
            {
                return IPAddress.Parse(((OwinContext)request.Properties["MS_OwinContext"]).Request.RemoteIpAddress).ToString();
            }
            return null;
        }
    }
}