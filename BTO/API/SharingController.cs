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
namespace BTO.API
{
    [RoutePrefix("api/sharing")]
    public class SharingController : BTOAPIController
    {
        public IMemberService memberService { get; set; }
        public IGroupService groupService { get; set; }     
     
        [Route("LoadViewer")]
        [HttpPost]
        // GET api/<controller>
        public List<string> GetViewers(JObject data)
        {
            dynamic json = data;           
            string _representer_mail = json.email;         
            return memberService.GetAllMemberGroup(_representer_mail);
        }

    }
}