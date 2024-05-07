using BTO.Model;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Service.Tracking;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Mvc; 

namespace BTO.Modules
{
    public class BTOActionWebApiFilter : System.Web.Http.Filters.ActionFilterAttribute
    {
        public string ClientActionType { get; set; }
        public override void OnActionExecuting(HttpActionContext actionContext)
        { 
            if (SystemTrackingLevelManagement.Instance.IsEnableTracking == true)
            {

                try
                {
                    var clientProfileSerive = DependencyResolver.Current.GetService<IClientProfileService>();
                    var request = ((HttpContextWrapper)actionContext.Request.Properties["MS_HttpContext"]).Request;
                    var ip = request.ServerVariables["HTTP_X_FORWARDED_FOR"];
                    if (!string.IsNullOrEmpty(ip))
                    {
                        string[] ipRange = ip.Split(',');
                        int le = ipRange.Length - 1;
                        string trueIP = ipRange[le];
                    }
                    else
                    {
                        ip = request.ServerVariables["REMOTE_ADDR"];
                    }

                    ClientProfileModel clientModel = new ClientProfileModel()
                    {                        
                        IP = ip,
                        UrlReferrer = actionContext.Request.Headers.Referrer.AbsoluteUri,
                        UserAgent = actionContext.Request.Headers.UserAgent.ToString(),
                        Userlanguages = actionContext.Request.Headers.AcceptLanguage.First().Value.ToString(),
                        Browser = Ultils.GetBrowserName(actionContext.Request.Headers.UserAgent),
                        BrowserPlatform = actionContext.Request.Headers.UserAgent.ElementAt(1).Comment,
                        BrowserVersion = Ultils.GetBrowserVersion(actionContext.Request.Headers.UserAgent),
                        //     SessionId = filterContext.HttpContext.Session.SessionID,
                        DateTime = DateTime.Now
                    };
                    // Log Action Filter Call
                    ClientProfile clientPro = new ClientProfile();
                    clientPro.level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking;
                    clientPro.time_create = DateTime.Now;
                    string cookie = actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString();
                    if (actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.ToString() != String.Empty)
                    {

                        cookie = actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString();
                        clientPro.user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(cookie, 0));
                    }
                    clientPro.serialized_data = Ultils.SerializeObject(clientModel); ;
                    clientProfileSerive.AddClientProfile(clientPro);
                }
                catch (Exception ex)
                {
                    var exceptionService = DependencyResolver.Current.GetService<ILogExceptionService>();
                    LogException log = new LogException()
                    {
                        level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                        Type = actionContext.ActionDescriptor.ActionName,
                        user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString(), 0)),
                        time_create = DateTime.Now,
                        message = ex.Message.ToString() + ex.StackTrace.ToString(),
                    };
                    exceptionService.AddLog(log);
                } 
            }
        } 
    }
}