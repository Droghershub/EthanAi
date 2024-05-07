using BTO.Model.Profile;
using BTO.Modules;
using BTO.Service.Profile;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BTO.API
{
    [RoutePrefix("api/tutorial")]
    //[BTOActionWebApiFilter]
    public class TutorialController : BTOAPIController
    {
        public ITutorialService tutorialService { get; set; }
        public IUserTutorialService userTutorialService { get; set; }
        [AllowAnonymous]
        [HttpGet]
        [Route("GetAll")] 
        public object GetAll()
        {
            return tutorialService.GetAll();
        }
        [Route("UpdateTutorial")]
        [HttpPost]
        public object UpdateTutorial(Tutorial  data)
        {
            tutorialService.Update(data);
            return Ok();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("GetTutorialOfUser/{user_id:guid}")]
        public object GetTutorialOfUser(Guid user_id)
        {
            return userTutorialService.GetUserTutorialByUserId(user_id);
        }

        [Route("UpdateUserTutorial")]
        [HttpPost]
        public object UpdateUserTutorial(UserTutorial data)
        {
            userTutorialService.Create(data);
            return Ok();
        }
    }
}
