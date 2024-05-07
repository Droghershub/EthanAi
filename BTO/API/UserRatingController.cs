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
    [RoutePrefix("api/userrating")]
    //[BTOActionWebApiFilter]
    public class UserRatingController : BTOAPIController
    {
        public IUserRatingService userRatingService { get; set; }        
        
        [AllowAnonymous]
        [HttpGet]
        [Route("GetUserRatingOfUser")]
        public List<UserRating> GetUserRatingOfUser()
        {
            return userRatingService.GetUserRatingOfUser(Guid.Parse(System.Web.HttpContext.Current.User.Identity.GetUserId()));
        }

        [Route("PostUserRating")]
        [HttpPost]
        public UserRating PostUserRating(UserRating data)
        {
            data.user_id =  Guid.Parse(System.Web.HttpContext.Current.User.Identity.GetUserId());
            data.time_create = DateTime.Now;
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            data.serialized_data = client.serialized_data;
            return userRatingService.PostUserRating(data);            
        }

       
    }
}
