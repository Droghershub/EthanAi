using BTO.Model;
using BTO.Model.Tracking;
using BTO.Modules;
using BTO.Service;
using BTO.Service.Tracking;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using BTO.Models;
namespace BTO.API
{
    [RoutePrefix("api/clientTracking")]
    public class ClientTrackingController : BTOAPIController
    {
        public IClientProfileService clientProfileService { get; set; }
        public IUserSessionService userSessionService { get; set; }
        public IOrganizationUnitUserService _organizationUnitUserService { get; set; }
        [HttpGet]
        [Route("GetAll")]
        public object GetAll()
        {
            return clientProfileService.GetAll();
        }
        [Route("GetUserSession")]
        [HttpPost]
        // GET api/<controller>
        public object GetUserSession(object id)
        {
            int client_profile_id = Convert.ToInt32(id);
            var cli = clientProfileService.GetById(client_profile_id);                        
            return userSessionService.GetByClientProfile(client_profile_id, cli.ui_version); ;
        }
        
        [Route("getSession")]
        [HttpPost]
        // GET api/<controller>
        public object getSession(Object pagingObject)
        {
            var user_id = System.Web.HttpContext.Current.User.Identity.GetUserId();
            JObject jsonObj = (JObject)pagingObject;
            var startIndex = 0;
            if (jsonObj.GetValue("start") != null) startIndex = (int)jsonObj.GetValue("start");
            var pageNumber = 10;
            if (jsonObj.GetValue("number") != null) pageNumber = (int)jsonObj.GetValue("number");
            var email = "";
            if (jsonObj.GetValue("email") != null) email = (string)jsonObj.GetValue("email");
            // Get Page number
            var countSession = clientProfileService.getCountSessions(user_id, startIndex, pageNumber, email);
            var numberOfPages = (int)((countSession - 1) / pageNumber) + 1;
            var sessions = clientProfileService.getSessions(user_id, startIndex, pageNumber, email).ToArray();
            return new  {
                numberOfPages = numberOfPages,
                data= sessions
            };
        }
    }
}