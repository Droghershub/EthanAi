using BTO.Helper;
using BTO.Model;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Modules;
using BTO.Service;
using BTO.Service.Tracking;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml.Serialization;
using Microsoft.AspNet.Identity;
using System.Web.Configuration;
using Microsoft.ApplicationInsights;
namespace BTO.Controllers
{
    // public class NewController : BTOController
    public class NewController : BTOController
    {
        public IOrganizationUnitUserService _organizationUnitUserService { get; set; }
        public IMemberService memberService { get; set; }
        public IPersonaService personaService { get; set; }
        public IProductVersionService _productVersionService { get; set; }
        public IParameterService _parameterService { get; set; }
        public IUserProfileService userProfileService { get; set; }
        private TelemetryClient telemetry = new TelemetryClient();
        public ActionResult Index()
        {
            try
            {
                string version = Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(User.Identity.GetUserId()));
                ViewBag.version_id_before_shared = version;
                ViewBag.user_id_before_shared = User.Identity.GetUserId();
                ViewBag.user_name_before_shared = User.Identity.GetUserName();

                ViewBag.version = version;
                ViewBag.userId = User.Identity.GetUserId();
                ViewBag.username = User.Identity.GetUserName();

                UserProfile userProfile = userProfileService.GetByUserId(Guid.Parse(User.Identity.GetUserId()));

                ViewBag.is_auto_register = "false";
                if (userProfile != null && userProfile.is_auto_register)
                {
                    ViewBag.is_auto_register = "true";
                }


                // Update timestamp
                //TimeSpan unixTicks = new TimeSpan(DateTime.UtcNow.Ticks);
                //ViewBag.timestamp = "timestamp=" + unixTicks.TotalSeconds;
                //ViewBag.timestamp = "timestamp=" + DateTime.Now.ToString("yyyyMMddHHmmssffff");
                ViewBag.timestamp = "version=1";
                ViewBag.inlineManualTopicId = WebConfigurationManager.AppSettings["InlineManualTopicId"].ToString();

                HttpCookie themeId = Request.Cookies["themeId"];


                if (themeId != null && memberService.IsMemberAreListening(User.Identity.GetUserName()))
                {
                    ViewBag.version = themeId.Value;
                }
                else
                {
                    ViewBag.version = version;
                }

                //ViewBag.version = "4"; 
                HttpCookie reloadsharing = Request.Cookies["reloadsharing"];
                HttpCookie reloadplayback = Request.Cookies["reloadplayback"];
                ProductVersion _prversion;
                if (reloadsharing != null && reloadsharing.Value == "true" && memberService.IsMemberAreListening(User.Identity.GetUserName()))
                {
                    ViewBag.version = Request.Cookies["themeId"].Value;
                    ViewBag.userId = Request.Cookies["userId"].Value;
                    ViewBag.username = Request.Cookies["username"].Value.Replace("((A))", "@");
                    ViewBag.user_name_are_taking_overing = Request.Cookies["user_name_are_taking_overing"].Value.Replace("((A))", "@");
                    _prversion = _productVersionService.GetByUserId(ViewBag.userId);
                    ViewBag.CashFlow = GlobalConfig.GetRule(_prversion.id, personaService.GetByUserId(Guid.Parse(Request.Cookies["userId"].Value)).ToList(), _parameterService);
                    ViewBag.CashFlowRuleConfig = GlobalConfig.GetRule(_prversion.id, _parameterService);
                }
                else if (reloadplayback != null && reloadplayback.Value == "true")
                {
                    ViewBag.version = Request.Cookies["playback_themeId"].Value;
                    ViewBag.version_id_before_shared = Request.Cookies["playback_themeId"].Value;
                    ViewBag.playback_id = Request.Cookies["playback_id"].Value;
                    ViewBag.playback_user_id = Request.Cookies["playback_user_id"].Value;
                    _prversion = _productVersionService.GetByUserId(ViewBag.playback_user_id);
                    ViewBag.CashFlow = GlobalConfig.GetRule(_prversion.id, personaService.GetByUserId(Guid.Parse(Request.Cookies["playback_user_id"].Value)).ToList(), _parameterService);
                    ViewBag.CashFlowRuleConfig = GlobalConfig.GetRule(_prversion.id, _parameterService);
                }
                else if (reloadsharing != null)
                {
                    Request.Cookies["reloadsharing"].Value = null;
                    Request.Cookies["themeId"].Value = null;
                    _prversion = _productVersionService.GetByUserId(User.Identity.GetUserId());
                    ViewBag.CashFlow = GlobalConfig.GetRule(_prversion.id, personaService.GetByUserId(Guid.Parse(User.Identity.GetUserId())).ToList(), _parameterService);
                    //ViewBag.CashFlow = GlobalConfig.GetRule(1, personaService.GetByUserId(Guid.Parse(User.Identity.GetUserId())).ToList());
                    ViewBag.CashFlowRuleConfig = GlobalConfig.GetRule(_prversion.id, _parameterService);
                }
                else
                {
                    _prversion = _productVersionService.GetByUserId(User.Identity.GetUserId());
                    ViewBag.CashFlow = GlobalConfig.GetRule(_prversion.id, personaService.GetByUserId(Guid.Parse(User.Identity.GetUserId())).ToList(), _parameterService);
                    //ViewBag.CashFlow = GlobalConfig.GetRule(1, personaService.GetByUserId(Guid.Parse(User.Identity.GetUserId())).ToList());
                    ViewBag.CashFlowRuleConfig = GlobalConfig.GetRule(_prversion.id, _parameterService);
                }
                ViewBag.product_version_id = _prversion.id;
                var path = Server.MapPath("~/Themes/" + ViewBag.version + "/Index.html");
                ViewBag.path = path;

                ViewBag.isPlayback = "false";
                if (reloadplayback != null && reloadplayback.Value == "true")
                {
                    ViewBag.isPlayback = "true";
                }


                if (User.IsInRole("Admin"))
                    ViewBag.IsAdmin = "true";
                else
                    ViewBag.IsAdmin = "false";

                ViewBag.APIJavaEngine = WebConfigurationManager.AppSettings["APIJavaEngine"].ToString();
                ViewBag.CodeChatOnline = WebConfigurationManager.AppSettings["CodeChatOnline"].ToString();
                ViewBag.Scheme = Request.Url.Scheme;
                ViewBag.isCanEditProfile = WebConfigBySingleton.Instance.isCanEditProfile;
            }
            catch (Exception ex)
            {
                telemetry.TrackException(ex);
            }
            return View();
        }
    }
}