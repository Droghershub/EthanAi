using Microsoft.ApplicationInsights;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Caching;
using System.Web.Http.Controllers;
using System.Web.Mvc;

namespace BTO.Modules
{

    public class RateLimitAttribute : System.Web.Http.Filters.ActionFilterAttribute
    {
        private TelemetryClient telemetry = new TelemetryClient();
        /// <summary>
        /// A unique name for this Throttle.
        /// </summary>
        /// <remarks>
        /// We'll be inserting a Cache record based on this name and client IP, e.g. "Name-192.168.0.1"
        /// </remarks>
        public string Name { get; set; }

        /// <summary>
        /// The number of seconds clients must wait before executing this decorated route again.
        /// </summary>
        public int Milliseconds { get; set; }

        /// <summary>
        /// A text message that will be sent to the client upon throttling.  You can include the token {n} to
        /// show this.Seconds in the message, e.g. "Wait {n} seconds before trying again".
        /// </summary>
        public string Message { get; set; }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            telemetry.TrackEvent("Calculation Request");
            var key = string.Concat(Name, "-", HttpContext.Current.User.Identity.Name);
            var allowExecute = false;

            if (HttpRuntime.Cache[key] == null)
            {
                HttpRuntime.Cache.Add(key,
                    true, // is this the smallest data we can have?
                    null, // no dependencies
                    DateTime.Now.AddMilliseconds(Milliseconds), // absolute expiration
                    Cache.NoSlidingExpiration,
                    CacheItemPriority.Low,
                    null); // no callback

                allowExecute = true;
                telemetry.TrackEvent("Accepted Calculation request");
            }

            if (!allowExecute)
            {
                telemetry.TrackEvent("Rejected Calculation request");
                if (string.IsNullOrEmpty(Message))
                {
                    Message = "You may only perform this action every {n} miliseconds.";
                }

                actionContext.Response = actionContext.Request.CreateResponse(
                    HttpStatusCode.Conflict,
                    Message.Replace("{n}", Milliseconds.ToString())
                );
            }
        }

        
    }
}