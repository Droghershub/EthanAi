using BTO.Model.Tracking;
using BTO.Models;
using BTO.Service.Tracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Filters;
using System.Web.Mvc;

namespace BTO.Modules
{
    public class ExceptionAPIFilterAttribute : ExceptionFilterAttribute 
    {
        public override void OnException(HttpActionExecutedContext context)
        {
            var exceptionService = DependencyResolver.Current.GetService<ILogExceptionService>();
            LogException log = new LogException()
            {
                level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                Type = context.GetType().Name,
                user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(context.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString(), 0)),
                time_create = DateTime.Now,
                message = context.Exception.Message.ToString() + context.Exception.StackTrace.ToString(),
            };
            exceptionService.AddLog(log);

            if (context.Exception is NotImplementedException)
            {
                context.Response = new HttpResponseMessage(HttpStatusCode.NotImplemented);
            }
        }
    }
}