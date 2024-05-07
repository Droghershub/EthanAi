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
using System.Web;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using System.Threading.Tasks;
using BTO.Admin.Models;
using BTO.Admin;
namespace BTO.API
{
    [Authorize]
    [RoutePrefix("api/ManageUser")]
    public class ManageUserController : BTOAPIController
    {
        
        public IAspNetUserService aspNetUserService { get; set; }
        public IUserProfileService userProfileService { get; set; }
        public IUserClaimsService aspNetUserClaimsService { get; set; }
        [HttpGet]
        [Route("GetAll")]
        public object GetAll()
        {
            return aspNetUserService.GetAll();
        }

        
        [Route("getSession")]
        [HttpPost]
        // GET api/<controller>
        public object getSession(Object pagingObject)
        {
            JObject jsonObj = (JObject)pagingObject;
            var startIndex = 0;
            if (jsonObj.GetValue("start") != null) startIndex = (int)jsonObj.GetValue("start");
            var pageNumber = 10;
            if (jsonObj.GetValue("number") != null) pageNumber = (int)jsonObj.GetValue("number");
            var email = "";
            if (jsonObj.GetValue("email") != null) email = (string)jsonObj.GetValue("email");
            // Get Page number
            var countSession = aspNetUserService.getCountSessions(startIndex, pageNumber, email);
            var numberOfPages = (int)((countSession - 1) / pageNumber) + 1;
            var sessions = aspNetUserService.getSessions(startIndex, pageNumber, email).ToArray();
            return new  {
                numberOfPages = numberOfPages,
                data= sessions
            };
        }

        [Route("DeActivationUser")]
        [HttpPost]
        public object DeActivationUser(AspNetUser user)
        {
            user.LockoutEndDateUtc = DateTime.Now.AddYears(1000);
            user.isActive = false;
            return aspNetUserService.UpdateUser(user);
        }

        [Route("ActivationUser")]
        [HttpPost]
        public object ActivationUser(AspNetUser user)
        {
            user.LockoutEndDateUtc = null;
            user.isActive = true;
            return aspNetUserService.UpdateUser(user);
        }
        
        [Route("ForceResetPassword")]
        [HttpPost]
        public object ForceResetPassword(AspNetUser user)
        {
            if (aspNetUserClaimsService.GetByClaimTypeAndUserId(user.id, "Force_Reset_Password") == null)
            {
                UserClaims claims = new UserClaims();
                claims.UserId = user.id;
                claims.ClaimType = "Force_Reset_Password";
                aspNetUserClaimsService.Create(claims);
            }
            return "Success";
        }

        [Route("ChangePassword")]
        [HttpPost]
        // GET api/<controller>
        public async Task<object> ChangePassword(BTO.Admin.Models.ChangePasswordViewModel model)
        {
            var obj = new BaseResponse<int>();
            var UserManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            
            var result = await UserManager.ChangePasswordAsync(HttpContext.Current.User.Identity.GetUserId(), model.OldPassword, model.NewPassword);
            
            if (result.Succeeded)
            {
                obj.results = 0;
                obj.success = true;
                obj.errcode = "Change Password successed!";
                return obj;                
            }
            obj.results = 1;
            obj.success = false;
            obj.errcode = "Failed to change the password";
            return obj;        
            
        }

        [HttpGet]
        [Route("ManageExternalLoginProviders")]
        public async Task<object> ManageExternalLoginProvidersAPI()
        {
            var UserManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();

            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
            var userLogins = await UserManager.GetLoginsAsync(User.Identity.GetUserId());
            AspNetUser aspNetUSer = aspNetUserService.GetById(Guid.Parse(User.Identity.GetUserId()));
            if (user.PasswordHash != null)
            {
                userLogins.Add(new UserLoginInfo(Contrainst.BasicLogin, aspNetUSer.id));
            }
            IList<ModelProviderLogin> list = new List<ModelProviderLogin>();
            foreach (var item in userLogins)
            {
                 if (aspNetUSer.DisableProviderList != null && aspNetUSer.DisableProviderList.Contains("," + item.LoginProvider)){
                     list.Add(new ModelProviderLogin()
                     {
                         name = item.LoginProvider,
                         key = item.ProviderKey,
                         status = true
                     });
                 }
                 else
                 {
                     list.Add(new ModelProviderLogin()
                     {
                         name = item.LoginProvider,
                         key = item.ProviderKey,
                         status = false
                     });
                 }
            }

            return list;
        }

        [HttpPost]
        [Route("DisableLoginProvider")]
        public async Task<object> DisableLoginProvider(JObject pagingObject)
        {
            JObject jsonObj = (JObject)pagingObject;
            var providerKey = "";
            if (jsonObj.GetValue("key") != null) providerKey = (string)jsonObj.GetValue("key");

            var loginProvider = "";
            if (jsonObj.GetValue("name") != null) loginProvider = (string)jsonObj.GetValue("name");

            var UserManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            AspNetUser aspNetUSer = aspNetUserService.GetById(Guid.Parse(User.Identity.GetUserId()));
            var result = new BaseResponse<int>();
            var userLogins = await UserManager.GetLoginsAsync(User.Identity.GetUserId());
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
            if (user.PasswordHash != null)
            {
                userLogins.Add(new UserLoginInfo(Contrainst.BasicLogin, aspNetUSer.id));
            }
            if (aspNetUSer.DisableProviderList == null || !aspNetUSer.DisableProviderList.Contains("," + loginProvider))
            { 
                if (aspNetUSer.DisableProviderList != null)
                {
                    var listDisabled = aspNetUSer.DisableProviderList.Split(',');
                    userLogins = userLogins.Where(t => listDisabled.All(u => !t.LoginProvider.Equals(u))).ToList();
                } 
                if (userLogins.Count > 1)
                {
                    aspNetUSer.DisableProviderList = aspNetUSer.DisableProviderList + "," + loginProvider;
                    aspNetUserService.UpdateDisableProviderList(Guid.Parse(User.Identity.GetUserId()), aspNetUSer.DisableProviderList); 
                   result.results = 0;
                   result.success = true;
                   result.errcode = "Disable login is successful";
                }
                else
                {
                    result.success = false;
                    result.errcode = "Failed to disable login"; 
                }
            }
            else
            {
                result.success = false;
                result.errcode = "Failed to disable login"; 
            } 
            return result; 
        }

        [HttpPost]
        [Route("EnableLoginProvider")]
        public async Task<object> EnableLoginProvider(JObject pagingObject)
        {
            var result = new BaseResponse<int>();
            JObject jsonObj = (JObject)pagingObject;
            var providerKey = "";
            if (jsonObj.GetValue("key") != null) providerKey = (string)jsonObj.GetValue("key");

            var loginProvider = "";
            if (jsonObj.GetValue("name") != null) loginProvider = (string)jsonObj.GetValue("name");

            AspNetUser aspNetUSer = aspNetUserService.GetById(Guid.Parse(User.Identity.GetUserId()));
            if (aspNetUSer.DisableProviderList != null && aspNetUSer.DisableProviderList.Contains("," + loginProvider))
            {
                aspNetUSer.DisableProviderList = aspNetUSer.DisableProviderList.Replace("," + loginProvider, "");
                aspNetUserService.UpdateDisableProviderList(Guid.Parse(User.Identity.GetUserId()), aspNetUSer.DisableProviderList); 
                result.success = true;
                result.errcode = "Enable login is successful";
            }
            else
            { 
                result.success = false;
                result.errcode = "Failed to enable login";
            }
            return result; 
        }

        [Route("UpdateAccount")]
        [HttpPost]
        // GET api/<controller>
        public async Task<object> UpdateAccount(BTO.Admin.Models.RegisterViewModel model)
        {
            var obj = new BaseResponse<int>();
            var UserManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();

            string email = model.Email;
            string password = model.Password;
            String hashedNewPassword = UserManager.PasswordHasher.HashPassword(password);
            var user = UserManager.FindById(HttpContext.Current.User.Identity.GetUserId());
            user.Email = email;
            user.UserName = email; 
            user.EmailConfirmed = false;
            user.PasswordHash = hashedNewPassword;           
            var result = await UserManager.UpdateAsync(user);// .ChangePasswordAsync(HttpContext.Current.User.Identity.GetUserId(), "Abc@1234511111", model.Password);

            if (result.Succeeded)
            {
                UserProfile userProfile = userProfileService.GetByUserId(Guid.Parse(user.Id));
                userProfile.email = email;
                userProfile.is_auto_register = false;
                userProfile.isChanged = false;
                userProfile.isChangedStartAge = false;
                userProfileService.Update(userProfile);

                // Send an email with this link
                string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                var requestContext = HttpContext.Current.Request.RequestContext;
                var callbackUrl = new System.Web.Mvc.UrlHelper(requestContext).Action("ConfirmEmail", "Account", new { userId = user.Id, code = code, provider = string.Empty }, protocol: HttpContext.Current.Request.Url.Scheme);
                // Update Value of Email
                Dictionary<string, string> dictionary = new Dictionary<string, string>()
                                                        {
                                                            {"CALLBACK_URL", callbackUrl}
                                                        };
                string body = Common.Mail.populateBody(Common.Mail.CONFIRM_ACCOUNT_TEMPLATE, dictionary);
                bool successfullySendMail = Common.Mail.Send(
                    model.Email,
                    "Confirm your account",
                    body
                    );



                obj.results = 0;
                obj.success = true;
                obj.errcode = "Change Account successed!";
                
                //HttpContext.Current.GetOwinContext().Authentication.SignOut();              


                return obj;
            }
            obj.results = 1;
            obj.success = false;
            if (result.Errors.First().Contains("already taken"))
                obj.errcode = "The email address you have entered is already registered";
            else
                obj.errcode = result.Errors.First();
            return obj;

        }

        [Route("CreateAccount")]
        [HttpPost]
        // GET api/<controller>
        public async Task<object> CreateAccount(BTO.Admin.Models.RegisterViewModel model)
        {
            var obj = new BaseResponse<int>();
            var UserManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
            var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
            var result = await UserManager.CreateAsync(user, model.Password);
            if (result.Succeeded)
            {
                string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                var confirmResult = await UserManager.ConfirmEmailAsync(user.Id, code);
                obj.success = true;
                return obj;
            }
            else
            {
                obj.success = false;
                obj.errmessage = result.Errors.FirstOrDefault();
                return obj;
            }
        }

    }
}