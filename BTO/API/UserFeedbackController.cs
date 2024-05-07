using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Modules;
using BTO.Service.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using System.Web.Http.Controllers;
using BTO.Model.Tracking;
using System.Web;

namespace BTO.API
{
    [RoutePrefix("api/userfeedback")]
    //[BTOActionWebApiFilter]
    public class UserFeedbackController : BTOAPIController
    {
        public IUserFeedbackService userFeedbackService { get; set; }        
        
        [AllowAnonymous]
        [HttpGet]
        [Route("get")]
        public List<UserFeedback> GetAllByCurrentUser()
        {
            return userFeedbackService.GetAllByUser(Guid.Parse(System.Web.HttpContext.Current.User.Identity.GetUserId()));
        }

        [Route("savefeedback")]
        [HttpPost]
        public UserFeedback SaveFeedback(UserFeedback data)
        {
            data.user_id =  Guid.Parse(System.Web.HttpContext.Current.User.Identity.GetUserId());
            data.time_create = DateTime.Now;
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            data.serialized_data = client.serialized_data;
            return userFeedbackService.PostUserFeedback(data);            
        } 
    }
}
