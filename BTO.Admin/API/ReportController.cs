using BTO.Admin.Models;
using BTO.Modules;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using BTO.Service.Tracking;
using System.Globalization;
using System.Threading;
using System.Web;

namespace BTO.Admin.API
{
    [Authorize]
    [RoutePrefix("api/report")]
    public class ReportController : BTOAPIController
    {
        public IClientProfileService clientProfileService { get; set; }
        public IUserSessionService userSessionService { get; set; }

        [Route("gettrackingclient")]
        [HttpPost]
        // GET api/<controller>
        public object getTrackingClient(JObject jsonObj)
        {
            var user_id = System.Web.HttpContext.Current.User.Identity.GetUserId();
            var startdate = DateTime.Now;
            if (jsonObj.GetValue("startdate") != null)
                startdate = DateTime.Parse((string)jsonObj.GetValue("startdate"), CultureInfo.GetCultureInfo("en-gb"));
            var enddate = DateTime.Now;
            if (jsonObj.GetValue("enddate") != null)
                enddate = DateTime.Parse((string)jsonObj.GetValue("enddate"), CultureInfo.GetCultureInfo("en-gb")).AddDays(1).AddSeconds(-1);
            
            string path = HttpContext.Current.Server.MapPath("~/ExportTracking/");

            string ServerPath = HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority) + "/ExportTracking/";
            
            ExportTrackingThread export = new ExportTrackingThread(startdate, enddate, clientProfileService, path, ServerPath, System.Web.HttpContext.Current.User.Identity.Name);
            Thread thread = new Thread(new ThreadStart(export.ThreadRun));
            thread.Start();
            //ThreadStart thread = new ThreadStart(clientProfileService.GetTrackingClientProfiles);
            return null;
        }

    }
}
