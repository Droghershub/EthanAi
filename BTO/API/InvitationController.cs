using BTO.Model;
using BTO.Modules;
using BTO.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json.Linq;
using System.Globalization;
namespace BTO.API
{
    [RoutePrefix("api/invitation")]
    public class InvitationController : BTOAPIController
    {
        
        public IInvitationService invitationService { get; set; }

        [Route("saveInviteList")]
        [HttpPost]        
        public object SaveInviteList(List<Invitation> list)
        {
            foreach (Invitation inv in list)
            {
                inv.date_created = DateTime.Now;
                invitationService.Create(inv);
            }
            return null;
        }
        [HttpPost]
        [Route("getReportList")]
        public object GetReportList(JObject data)
        {
            var user_id = System.Web.HttpContext.Current.User.Identity.GetUserId();            
            var startdate = DateTime.Now.AddDays(-30);
            if (data.GetValue("startdate") != null)
                startdate = DateTime.Parse((string)data.GetValue("startdate"), CultureInfo.GetCultureInfo("en-gb"));
            var enddate = DateTime.Now;
            if (data.GetValue("enddate") != null)
                enddate = DateTime.Parse((string)data.GetValue("enddate"), CultureInfo.GetCultureInfo("en-gb")).AddDays(1).AddSeconds(-1);
            return invitationService.GetInvitationList(startdate, enddate);            
        }
        [HttpGet]
        [Route("getInvitationDefault")]
        public object getInvitationDefault()
        {
            string ip="";
            if (Request.Properties.ContainsKey("MS_HttpContext"))
            {
                ip =  ((System.Web.HttpContextWrapper)Request.Properties["MS_HttpContext"]).Request.UserHostAddress;
            }
            
            else if (System.Web.HttpContext.Current != null)
            {
                ip = System.Web.HttpContext.Current.Request.UserHostAddress;
            }
            Invitation inv = new Invitation();

            inv.user_id = Guid.Parse(System.Web.HttpContext.Current.User.Identity.GetUserId()); ;
            inv.ip = ip;
            return inv;            
        }

    }
}