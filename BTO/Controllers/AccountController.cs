using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using BTO.Models;
using BTO.Modules;
using BTO.Service.Profile;
using BTO.Service.Tracking;
using BTO.Model.Profile;
using BTO.Service;
using BTO.Model;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TweetSharp;
using System.Text;
using System.Web.Configuration;
using System.Net;
using BTO.Helper;
using Microsoft.ApplicationInsights;
namespace BTO.Controllers
{
    public class AccountController : BTOController
    {
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;
        private IClientProfileService _clientProfileService = DependencyResolver.Current.GetService<IClientProfileService>();

        private IUserClaimsService _userClaimsService = DependencyResolver.Current.GetService<IUserClaimsService>();
        private IUserProfileService _userProfileService = DependencyResolver.Current.GetService<IUserProfileService>();
        public IGroupService groupService { get; set; }
        public IMemberService memberService { get; set; }
        public IAspNetUserService aspNetUserService { get; set; }
        public IImageManagementService _imageManagementService { get; set; }
        public IOrganizationUnitUserService _organizationUnitUserService { get; set; }
        private TelemetryClient telemetry = new TelemetryClient();
        public AccountController()
        {
        }

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager)
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        [AllowAnonymous]
        public ActionResult AutoRegister(string id)
        {
            if (!bool.Parse(Ultils.GetValueByKeyFromConfig("AutoRegister")))
            {
                return RedirectToAction("Login", "Account");
            }
            else
            {
                AuthenticationViewModel model = new AuthenticationViewModel();
                model.Type = id;
                return View(model);
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> AutoRegister(AuthenticationViewModel model)
        {
            if (model.Username == "Hercules" && model.Password == "9izYz84m?3")
            {
                string id = "4";
                if (!User.Identity.IsAuthenticated)
                {
                    RegisterHelper registerHelper = new RegisterHelper();
                    String value = registerHelper.GetUser(System.Web.HttpContext.Current.Request);
                    string username = value;
                    string password = "Abc@12345";
                    var user = new ApplicationUser { UserName = username, Email = username };
                    if (!string.IsNullOrEmpty(id) && id == "4")
                    {
                        int type = Int32.Parse(id);
                        HttpCookie cookie = Request.Cookies["username_zymi"];
                        if (cookie == null)
                        {
                            var result = await UserManager.CreateAsync(user, password);
                            string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                            var confirmResult = await UserManager.ConfirmEmailAsync(user.Id, code);
                            registerHelper.CreateProfile(Guid.Parse(user.Id), user.UserName, type);
                            cookie = new HttpCookie("username_zymi");
                            cookie.Value = user.UserName;
                            cookie.Expires = DateTime.Now.AddYears(1);
                            Response.Cookies.Add(cookie);
                        }
                        else
                        {
                            var userExisting = await UserManager.FindByNameAsync(cookie.Value);
                            if (userExisting != null)
                                username = userExisting.UserName;
                            else
                            {
                                var result = await UserManager.CreateAsync(user, password);
                                string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                                var confirmResult = await UserManager.ConfirmEmailAsync(user.Id, code);
                                registerHelper.CreateProfile(Guid.Parse(user.Id), user.UserName, type);
                                cookie = new HttpCookie("username_zymi");
                                cookie.Value = user.UserName;
                                cookie.Expires = DateTime.Now.AddYears(1);
                                Response.Cookies.Add(cookie);
                            }
                        }


                        return await this.Login(new LoginViewModel() { Email = username, Password = password, RememberMe = false }, "~/");

                    }
                    else
                        return RedirectToLocal("~/");
                }
                else
                    return RedirectToLocal("~/");
            }
            else return View();


        }


        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            HttpContext.Session["ProfileSession"] = null;
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        //
        // POST: /Account/Login
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Login(LoginViewModel model, string returnUrl)
        {
            telemetry.TrackEvent("Login Attemps");
            if (!ModelState.IsValid)
            {
                telemetry.TrackEvent("Login Rejected");
                return View(model);
            }

            // Require the user to have a confirmed email before they can log on.
            AspNetUser currentUser = aspNetUserService.GetByEmail(model.Email);
            if (currentUser != null && !currentUser.EmailConfirmed)
            {
                ViewBag.Message = "You must have a confirmed email to log on.";
                return View("Info");
            }
            if (currentUser != null && currentUser.DisableProviderList != null && currentUser.DisableProviderList.Contains("," + Contrainst.BasicLogin))
            {
                ViewBag.Message = "Your account has been disabled login by " + Contrainst.BasicLogin;
                AuthenticationManager.SignOut();
                return View("Info");
            }
            // This doesn't count login failures towards account lockout
            // To enable password failures to trigger account lockout, change to shouldLockout: true
            var result = await SignInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, shouldLockout: false);

            switch (result)
            {
                case SignInStatus.Success:                    
                    if (model.Email != null)
                    {

                        var claims = _userClaimsService.GetByClaimTypeAndUserId(currentUser.id, "Force_Reset_Password");
                        if (claims != null)
                        {

                            string code = await UserManager.GeneratePasswordResetTokenAsync(currentUser.id);

                            return RedirectToAction("ResetPassword", "Account", new { userId = currentUser.id, code = code });
                        }
                        ClientProfileModel clientModel = new ClientProfileModel()
                        {
                            IP = Request.UserHostName,
                            UrlReferrer = Request.UrlReferrer == null ? "" : Request.UrlReferrer.ToString(),
                            UserAgent = Request.UserAgent,
                            Userlanguages = Request.UserLanguages[0].ToString(),
                            Browser = Request.Browser.Browser,
                            BrowserPlatform = Request.Browser.Platform,
                            BrowserVersion = Request.Browser.MajorVersion.ToString(),
                            DateTime = DateTime.Now
                        };
                        // Log Action Filter Call
                        BTO.Model.Tracking.ClientProfile client = new BTO.Model.Tracking.ClientProfile();
                        client.level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking;
                        client.time_create = DateTime.Now;
                        client.email = model.Email;

                        client.serialized_data = Ultils.SerializeObject(clientModel);
                        client.time_update = DateTime.Now;
                        client.ui_version = Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(currentUser.id));
                        client = _clientProfileService.AddClientProfile(client);

                        Session.Add("ProfileSession", client);
                        Session.Add("Lastest_Access_Time", DateTime.Now);
                    }


                    //If user is owner of group
                    //Group group = groupService.GetGroupByEmail(model.Email);
                    //if (group != null)
                    //{
                    //    //Remove all members on group
                    //    memberService.RemoveAllMemberGroup(group.id);
                    //    //Delete group
                    //    groupService.DeleteGroup(model.Email);
                    //}
                    ////If user is member normal
                    //memberService.RemoveMemberGroup(model.Email);
                    //if (Request.Cookies["reloadsharing"] != null && Request.Cookies["reloadsharing"].Value != null)
                    //Request.Cookies["reloadsharing"].Value = null;

                    //return RedirectToLocal("~/New");
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = model.RememberMe });
                case SignInStatus.Failure:                  
                default:
                    telemetry.TrackEvent("Login Rejected");
                    ModelState.AddModelError("", "Invalid login attempt.");
                    return View(model);
            }
        }

        //
        // GET: /Account/VerifyCode
        [AllowAnonymous]
        public async Task<ActionResult> VerifyCode(string provider, string returnUrl, bool rememberMe)
        {
            // Require that the user has already logged in via username/password or external login
            if (!await SignInManager.HasBeenVerifiedAsync())
            {
                return View("Error");
            }
            return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/VerifyCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> VerifyCode(VerifyCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // The following code protects for brute force attacks against the two factor codes. 
            // If a user enters incorrect codes for a specified amount of time then the user account 
            // will be locked out for a specified amount of time. 
            // You can configure the account lockout settings in IdentityConfig
            var result = await SignInManager.TwoFactorSignInAsync(model.Provider, model.Code, isPersistent: model.RememberMe, rememberBrowser: model.RememberBrowser);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(model.ReturnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.Failure:
                default:
                    ModelState.AddModelError("", "Invalid code.");
                    return View(model);
            }
        }

        //
        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult Register()
        {
            if (bool.Parse(Ultils.GetValueByKeyFromConfig("DisableRegister")))
                return RedirectToAction("Login", "Account");
            else
                return View();
        }

        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
                var result = await UserManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);

                    // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=320771
                    // Send an email with this link
                    string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code, provider = string.Empty }, protocol: Request.Url.Scheme);
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
                    if (successfullySendMail)
                    {
                        ViewBag.Message = "Check your email and confirm your account, you must be confirmed "
                            + "before you can log in.";
                    }
                    else
                    {
                        ViewBag.Message = "Failed to send confirmation email. Inform the administrator immediately. There is nothing you can do to fix this issue";
                    }
                    return View("Info");
                }
                AddErrors(result);
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ConfirmEmail
        [AllowAnonymous]
        public async Task<ActionResult> ConfirmEmail(string userId, string code, string provider)
        {
            if (userId == null || code == null)
            {
                return View("Error");
            }
            if (provider == string.Empty || provider == null)
            {
                var result = await UserManager.ConfirmEmailAsync(userId, code);
                ViewBag.Message = "Check your email and confirm your account, you must be confirmed "
                        + "before you can log in.";

                ViewBag.Message = result.Succeeded ? "Your account is already confirmed" : "Error";
                return View("Info");
            }
            else if (provider == "Twitter")
            {
                try
                {
                    AspNetUser user = aspNetUserService.GetById(Guid.Parse(userId));
                    user.EmailConfirmedProvider = true;
                    aspNetUserService.Update(user);
                    ViewBag.Message = "Your account is already confirmed";
                    return View("Info");
                }
                catch (Exception)
                {
                    ViewBag.Message = "Error";
                    return View("Info");
                }
            }
            ViewBag.Message = "Error";
            return View("Info");
        }

        //
        // GET: /Account/ForgotPassword
        [AllowAnonymous]
        public ActionResult ForgotPassword()
        {
            ForgotPasswordViewModel model = new ForgotPasswordViewModel();
            model.Error = "";
            //  ModelState.AddModelError("", "The email that you tried to reset does not exist!");
            return View(model);
        }

        //
        // POST: /Account/ForgotPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByNameAsync(model.Email);
                if (user == null)
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    //  model.Error = "{{'The email that you tried to reset does not exist' | translate }}";
                    //ModelState.AddModelError("", "The email that you tried to reset does not exist!");
                    //return View(model);
                    return RedirectToAction("ForgotPasswordConfirmation", "Account");
                }

                // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=320771
                // Send an email with this link
                string code = await UserManager.GeneratePasswordResetTokenAsync(user.Id);
                var callbackUrl = Url.Action("ResetPassword", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                // Update Value of Email
                Dictionary<string, string> dictionary = new Dictionary<string, string>()
                                                        {
                                                            {"CALLBACK_URL", callbackUrl}
                                                        };
                string body = Common.Mail.populateBody(Common.Mail.RESET_PASSWORD_TEMPLATE, dictionary);

                bool successfullySendMail = Common.Mail.Send(model.Email, "Reset Password", body);
                if (successfullySendMail)
                {
                    return RedirectToAction("ForgotPasswordConfirmation", "Account");
                }
                else
                {
                    ViewBag.Message = "Failed to send email for reset your password. Inform the administrator immediately. There is nothing you can do to fix this issue";
                    return View("Info");
                }


            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ForgotPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        //
        // GET: /Account/ResetPassword
        [AllowAnonymous]
        public ActionResult ResetPassword(string userId, string code)
        {
            if (userId == null)
                return View("Error");
            else
            {
                var user = UserManager.FindById(userId);
                if (user == null)
                    return View("Error");
                else
                {
                    ResetPasswordViewModel model = new ResetPasswordViewModel();
                    model.Email = user.Email;
                    model.Code = code;
                    model.Password = "";
                    model.ConfirmPassword = "";
                    return View(model);
                }
            }
        }

        //
        // POST: /Account/ResetPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = await UserManager.FindByNameAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            var result = await UserManager.ResetPasswordAsync(user.Id, model.Code, model.Password);
            if (result.Succeeded)
            {
                if (!await UserManager.IsEmailConfirmedAsync(user.Id))
                {
                    string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    var confirmResult = await UserManager.ConfirmEmailAsync(user.Id, code);
                }

                _userClaimsService.DeleteByClaimTypeAndUserId(user.Id, "Force_Reset_Password");
                return RedirectToAction("ResetPasswordConfirmation", "Account");
            }
            // ModelState.AddModelError("", "Email don't exist!");
            ModelState.AddModelError("", "Invalid login attempt.");
            AddErrors(result);
            return View();
        }

        //
        // GET: /Account/ResetPasswordConfirmation
        [AllowAnonymous]
        public ActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        //
        // POST: /Account/ExternalLogin
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            // Request a redirect to the external login provider
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }

        //
        // GET: /Account/SendCode
        [AllowAnonymous]
        public async Task<ActionResult> SendCode(string returnUrl, bool rememberMe)
        {
            var userId = await SignInManager.GetVerifiedUserIdAsync();
            if (userId == null)
            {
                return View("Error");
            }
            var userFactors = await UserManager.GetValidTwoFactorProvidersAsync(userId);
            var factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
            return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/SendCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SendCode(SendCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            // Generate the token and send it
            if (!await SignInManager.SendTwoFactorCodeAsync(model.SelectedProvider))
            {
                return View("Error");
            }
            return RedirectToAction("VerifyCode", new { Provider = model.SelectedProvider, ReturnUrl = model.ReturnUrl, RememberMe = model.RememberMe });
        }

        //
        // GET: /Account/ExternalLoginCallback
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            telemetry.TrackEvent("Login Attemps");
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            else if (loginInfo.Login.LoginProvider.Equals("Twitter"))
            {
                loginInfo.Email = aspNetUserService.GetEmailFromProviderKey(loginInfo.Login.ProviderKey);
            }

            AspNetUser currentUser = aspNetUserService.GetByEmail(loginInfo.Email);
            if (currentUser == null && bool.Parse(Ultils.GetValueByKeyFromConfig("DisableRegister")))
                return RedirectToAction("Login", "Account");

            // Check account already connect to social network
            if (currentUser != null && User.Identity.IsAuthenticated && User.Identity.GetUserName() != currentUser.Email)
            {
                ViewBag.Title = "Warning";
                ViewBag.Message = "Your account can not connect to the social login via " + loginInfo.Login.LoginProvider;
                ViewBag.Back = "OK";
                return View("Info");
            }

            if (currentUser != null && currentUser.DisableProviderList != null && currentUser.DisableProviderList.Contains("," + loginInfo.Login.LoginProvider))
            {
                ViewBag.Title = "Warning";
                ViewBag.Message = "Your account has been disabled login via " + loginInfo.Login.LoginProvider;
                AuthenticationManager.SignOut();
                return View("Info");
            }

            // Sign in the user with this external login provider if the user already has a login
            var result = await SignInManager.ExternalSignInAsync(loginInfo, isPersistent: false);
            switch (result)
            {
                case SignInStatus.Success:                  


                    if (loginInfo.Login.LoginProvider.Equals("Twitter"))
                    {
                        AspNetUser userDTO = aspNetUserService.GetByEmail(loginInfo.Email);
                        if (userDTO.EmailConfirmedProvider == false || userDTO.EmailConfirmedProvider == null)
                        {
                            ViewBag.Message = "You must have a confirmed email to log on.";
                            return View("Info");
                        }
                    }

                    ClientProfileModel clientModel = new ClientProfileModel()
                    {
                        IP = Request.UserHostName,
                        UrlReferrer = Request.UrlReferrer == null ? "" : Request.UrlReferrer.ToString(),
                        UserAgent = Request.UserAgent,
                        Userlanguages = Request.UserLanguages[0].ToString(),
                        Browser = Request.Browser.Browser,
                        BrowserPlatform = Request.Browser.Platform,
                        BrowserVersion = Request.Browser.MajorVersion.ToString(),
                        DateTime = DateTime.Now
                    };
                    // Log Action Filter Call
                    BTO.Model.Tracking.ClientProfile client = new BTO.Model.Tracking.ClientProfile();
                    client.level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking;
                    client.time_create = DateTime.Now;
                    client.email = loginInfo.Email;

                    client.serialized_data = Ultils.SerializeObject(clientModel);
                    client.time_update = DateTime.Now;
                    client.ui_version = Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(currentUser.id));
                    client = _clientProfileService.AddClientProfile(client);

                    Session.Add("ProfileSession", client);
                    Session.Add("Lastest_Access_Time", DateTime.Now);
                    return RedirectToLocal(returnUrl);
                case SignInStatus.LockedOut:
                    return View("Lockout");
                case SignInStatus.RequiresVerification:
                    return RedirectToAction("SendCode", new { ReturnUrl = returnUrl, RememberMe = false });
                case SignInStatus.Failure:
                default:
                    // If the user does not have an account, then prompt the user to create an account
                    ViewBag.ReturnUrl = returnUrl;
                    ViewBag.LoginProvider = loginInfo.Login.LoginProvider;

                    if (loginInfo.Login.LoginProvider == "Google")
                    {
                        var json = JObject.Parse(loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:tokens:google:name").Value);
                        string firstName = (string)json["givenName"];
                        string lastName = (string)json["familyName"];
                        var genderTmp = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:tokens:google:gender");
                        //var genderStr = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:tokens:google:gender").Value;
                        var genderStr = genderTmp == null ? null : genderTmp.Value;
                        var avatarUrlTmp = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:tokens:google:image").Value;
                        //string avatarUrl = (string)JObject.Parse(loginInfo.ExternalIdentity.Claims.FirstOrDefault(c=>c.Type == "urn:tokens:google:image").Value)["url"]; 
                        string avatarUrl = avatarUrlTmp == null ? "" : (string)JObject.Parse(avatarUrlTmp)["url"];
                        avatarUrl = avatarUrl.Replace("sz=50", "sz=400");
                        int gender = -1;
                        if (genderStr != null)
                        {
                            if (genderStr.ToLower() == "male")
                            {
                                gender = 0;
                            }
                            else if (genderStr.ToLower() == "female")
                            {
                                gender = 1;
                            }
                        }
                        return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel
                        {
                            Email = loginInfo.Email,
                            firstName = firstName,
                            lastName = lastName,
                            gender = gender,
                            loginProvider = loginInfo.Login.LoginProvider,
                            isAccountExisted = UserManager.FindByEmail(loginInfo.Email) == null ? false : true,
                            avatar = avatarUrl
                        });
                    }
                    else if (loginInfo.Login.LoginProvider.Equals("LinkedIn"))
                    {

                        string accessToken = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type.Equals("LinkedIn:AccessToken")).Value.ToString();

                        string urlPicture = GetUrlPictureFromLinkedIn(accessToken);

                        var firstName = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type.Equals("LinkedIn:FirstName"));
                        var lastName = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type.Equals("LinkedIn:LastName"));

                        return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel
                        {
                            Email = loginInfo.Email,
                            firstName = firstName == null ? "" : firstName.Value.ToString(),
                            lastName = lastName == null ? "" : lastName.Value.ToString(),
                            loginProvider = loginInfo.Login.LoginProvider,
                            isAccountExisted = UserManager.FindByEmail(loginInfo.Email) == null ? false : true,
                            avatar = urlPicture
                        });
                    }
                    else if (loginInfo.Login.LoginProvider.Equals("Facebook"))
                    {
                        var firstName = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:facebook:first_name");
                        var lastName = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:facebook:last_name");
                        var genderStr = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:facebook:gender");
                        string avatar = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:facebook:id").Value.ToString();
                        avatar = String.Format("https://graph.facebook.com/{0}/picture?height=400&width=400", avatar);
                        int gender = -1;
                        if (genderStr != null)
                        {
                            if (genderStr.Value.ToLower() == "male")
                            {
                                gender = 0;
                            }
                            else if (genderStr.Value.ToLower() == "female")
                            {
                                gender = 1;
                            }
                        }

                        return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel
                        {
                            Email = loginInfo.Email,
                            firstName = firstName == null ? "" : firstName.Value.ToString(),
                            lastName = lastName == null ? "" : lastName.Value.ToString(),
                            gender = gender,
                            loginProvider = loginInfo.Login.LoginProvider,
                            isAccountExisted = UserManager.FindByEmail(loginInfo.Email) == null ? false : true,
                            avatar = avatar
                        });
                    }
                    else if (loginInfo.Login.LoginProvider.Equals("Twitter"))
                    {
                        var AccessToken = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:tokens:twitter:accessToken").Value;
                        var AccessTokenSecret = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == "urn:tokens:twitter:accessTokenSecret").Value;
                        string TwitterConsumerKey = WebConfigurationManager.AppSettings["TwitterConsumerKey"].ToString();
                        string TwitterConsumerSecret = WebConfigurationManager.AppSettings["TwitterConsumerSecret"].ToString();
                        var service = new TwitterService(TwitterConsumerKey, TwitterConsumerSecret);
                        service.AuthenticateWith(AccessToken, AccessTokenSecret);
                        var info = service.GetUserProfile(new GetUserProfileOptions());

                        dynamic x = JsonConvert.DeserializeObject(service.Response.Response.ToString());
                        string avatarPicture = x.profile_image_url;
                        var firstName = info == null ? "" : info.Name;

                        return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel
                        {
                            Email = "",
                            firstName = firstName,
                            location = info.Location,
                            providerKey = loginInfo.Login.ProviderKey,
                            loginProvider = loginInfo.Login.LoginProvider,
                            isAccountExisted = false,
                            avatar = avatarPicture
                        });
                    }
                    else
                    {
                        return View("ExternalLoginConfirmation", new ExternalLoginConfirmationViewModel { Email = loginInfo.Email, isAccountExisted = false });
                    }
            }
        }

        private string GetUrlPictureFromLinkedIn(string accessToken)
        {
            string result = string.Empty;//picture-urls::(original)
            var apiRequrestResult = new Uri("https://api.linkedin.com/v1/people/~:(picture-url)?format=json");
            using (var webclient = new WebClient())
            {
                webclient.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + accessToken);
                var json = webclient.DownloadString(apiRequrestResult);
                dynamic x = JsonConvert.DeserializeObject(json);
                string userPicture = x.pictureUrl;
                result = userPicture;
            }

            return result;
        }
        //
        // POST: /Account/ExternalLoginConfirmation
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ExternalLoginConfirmation(ExternalLoginConfirmationViewModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                // Get the information about the user from the external login provider
                var info = await AuthenticationManager.GetExternalLoginInfoAsync();
                if (info == null)
                {
                    return View("ExternalLoginFailure");
                }
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email };

                var appUser = await UserManager.FindByEmailAsync(user.Email);
                IdentityResult result = null;
                if (appUser != null)
                {

                    result = await UserManager.AddLoginAsync(appUser.Id, info.Login);
                    user.Id = appUser.Id;
                    if (result.Succeeded)
                    {
                        string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                        var confirm = await UserManager.ConfirmEmailAsync(user.Id, code);

                        UserProfile userProfile = GetUpdateExternalProfile(model);
                        if (userProfile != null)
                        {
                            _userProfileService.UpdateExternalProfile(userProfile);
                        }

                        if (model.loginProvider.Equals("Twitter"))
                        {
                            var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code, provider = "Twitter" }, protocol: Request.Url.Scheme);
                            // Update Value of Email
                            Dictionary<string, string> dictionary = new Dictionary<string, string>()
                                                        {
                                                            {"CALLBACK_URL", callbackUrl}
                                                        };
                            string body = Common.Mail.populateBody(Common.Mail.CONFIRM_ACCOUNT_TEMPLATE, dictionary);

                            bool successfullySendMail = Common.Mail.Send(model.Email, "Confirm your account", body);
                            if (successfullySendMail)
                            {
                                ViewBag.Message = "Check your email and confirm your account, you must be confirmed "
                                    + "before you can log in.";
                            }
                            else
                            {
                                ViewBag.Message = "Failed to send confirmation email. Inform the administrator immediately. There is nothing you can do to fix this issue";
                            }

                            return View("Info");
                        }

                        await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                        ClientProfileModel clientModel = new ClientProfileModel()
                        {
                            IP = Request.UserHostName,
                            UrlReferrer = Request.UrlReferrer == null ? "" : Request.UrlReferrer.ToString(),
                            UserAgent = Request.UserAgent,
                            Userlanguages = Request.UserLanguages[0].ToString(),
                            Browser = Request.Browser.Browser,
                            BrowserPlatform = Request.Browser.Platform,
                            BrowserVersion = Request.Browser.MajorVersion.ToString(),
                            DateTime = DateTime.Now
                        };
                        // Log Action Filter Call
                        BTO.Model.Tracking.ClientProfile client = new BTO.Model.Tracking.ClientProfile();
                        client.level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking;
                        client.time_create = DateTime.Now;
                        client.email = model.Email;

                        client.serialized_data = Ultils.SerializeObject(clientModel);
                        client.time_update = DateTime.Now;
                        client.ui_version = Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(user.Id));
                        client = _clientProfileService.AddClientProfile(client);

                        Session.Add("ProfileSession", client);
                        Session.Add("Lastest_Access_Time", DateTime.Now);
                        return RedirectToLocal(returnUrl);
                    }
                }
                else
                {
                    result = await UserManager.CreateAsync(user);
                }
                //var result = await UserManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    result = await UserManager.AddLoginAsync(user.Id, info.Login);
                    if (model.loginProvider.Equals("Twitter"))
                    {
                        string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                        var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code, provider = "Twitter" }, protocol: Request.Url.Scheme);
                        // Update Value of Email
                        Dictionary<string, string> dictionary = new Dictionary<string, string>()
                                                        {
                                                            {"CALLBACK_URL", callbackUrl}
                                                        };
                        string body = Common.Mail.populateBody(Common.Mail.CONFIRM_ACCOUNT_TEMPLATE, dictionary);

                        bool successfullySendMail = Common.Mail.Send(model.Email, "Confirm your account", body);

                        if (successfullySendMail)
                        {
                            ViewBag.Message = "Check your email and confirm your account, you must be confirmed "
                                + "before you can log in.";
                        }
                        else
                        {
                            ViewBag.Message = "Failed to send confirmation email. Inform the administrator immediately. There is nothing you can do to fix this issue";
                        }

                        UserProfile userProfile = GetUpdateExternalProfile(model);
                        if (userProfile != null)
                        {
                            _userProfileService.UpdateExternalProfile(userProfile);
                            if (!String.IsNullOrEmpty(userProfile.avatar))
                            {
                                _imageManagementService.Add(new Image()
                                {
                                    url = userProfile.avatar,
                                    user_id = Guid.Parse(user.Id)
                                });
                            }
                        }

                        return View("Info");
                    }
                    if (result.Succeeded)
                    {
                        await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);

                        ClientProfileModel clientModel = new ClientProfileModel()
                        {
                            IP = Request.UserHostName,
                            UrlReferrer = Request.UrlReferrer == null ? "" : Request.UrlReferrer.ToString(),
                            UserAgent = Request.UserAgent,
                            Userlanguages = Request.UserLanguages[0].ToString(),
                            Browser = Request.Browser.Browser,
                            BrowserPlatform = Request.Browser.Platform,
                            BrowserVersion = Request.Browser.MajorVersion.ToString(),
                            DateTime = DateTime.Now
                        };
                        // Log Action Filter Call
                        BTO.Model.Tracking.ClientProfile client = new BTO.Model.Tracking.ClientProfile();
                        client.level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking;
                        client.time_create = DateTime.Now;
                        client.email = model.Email;

                        client.serialized_data = Ultils.SerializeObject(clientModel);
                        client.time_update = DateTime.Now;
                        client.ui_version = Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(user.Id));
                        client = _clientProfileService.AddClientProfile(client);

                        Session.Add("ProfileSession", client);
                        Session.Add("Lastest_Access_Time", DateTime.Now);
                        UserProfile userProfile = GetUpdateExternalProfile(model);
                        if (userProfile != null)
                        {
                            _userProfileService.UpdateExternalProfile(userProfile);
                            if (!String.IsNullOrEmpty(userProfile.avatar))
                            {
                                _imageManagementService.Add(new Image()
                                {
                                    url = userProfile.avatar,
                                    user_id = client.user_id
                                });
                            }
                        }
                        return RedirectToLocal(returnUrl);
                    }
                }
                AddErrors(result);
            }

            ViewBag.ReturnUrl = returnUrl;
            return View(model);
        }

        //
        // POST: /Account/LogOff
        [AllowAnonymous]
        public async Task<ActionResult> LogOff()
        {
            telemetry.TrackEvent("LogOff");
            AuthenticationManager.SignOut();
            return RedirectToAction("Login", "Account");
        }

        [AllowAnonymous]
        public async Task<ActionResult> LogOffAndResetPlan()
        {
            HttpCookie cookie = Request.Cookies["username_zymi"];
            if (cookie != null)
            {
                cookie.Expires = DateTime.Now.AddDays(-1d);
                Response.Cookies.Add(cookie);
            }

            string id = "4";
            if (true)
            {
                RegisterHelper registerHelper = new RegisterHelper();
                String value = registerHelper.GetUser(System.Web.HttpContext.Current.Request);
                string username = value;
                string password = "Abc@12345";
                var user = new ApplicationUser { UserName = username, Email = username };
                if (!string.IsNullOrEmpty(id) && id == "4")
                {
                    int type = Int32.Parse(id);
                    HttpCookie cookie1 = Request.Cookies["username_zymi"];
                    if (cookie1 == null)
                    {
                        var result = await UserManager.CreateAsync(user, password);
                        string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                        var confirmResult = await UserManager.ConfirmEmailAsync(user.Id, code);
                        registerHelper.CreateProfile(Guid.Parse(user.Id), user.UserName, type);
                        cookie1 = new HttpCookie("username_zymi");
                        cookie1.Value = user.UserName;
                        cookie1.Expires = DateTime.Now.AddYears(1);
                        Response.Cookies.Add(cookie1);
                    }
                    else
                    {
                        user = await UserManager.FindByNameAsync(cookie1.Value);
                        if (user != null)
                            username = user.UserName;
                    }


                    return await this.Login(new LoginViewModel() { Email = username, Password = password, RememberMe = false }, "~/");

                }
                else
                    return RedirectToLocal("~/");
            }
            else
                return RedirectToLocal("~/");
        }

        [AllowAnonymous]
        public async Task<ActionResult> BackWebsite()
        {
            AuthenticationManager.SignOut();
            return Redirect("http://www.zymi.biz/");
        }


        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }
        private UserProfile GetUpdateExternalProfile(ExternalLoginConfirmationViewModel model)
        {
            UserProfile userProfile = new UserProfile();
            bool isHasUpdateData = false;
            userProfile.email = model.Email;
            if (model.isSelectedFirstName == true)
            {
                userProfile.first_name = model.firstName;
                isHasUpdateData = true;
            }
            if (model.isSelectedGender == true)
            {
                userProfile.gender = model.gender;
                isHasUpdateData = true;
            }
            else
            {
                userProfile.gender = -1;
            }
            if (model.isSelectedLastName == true)
            {
                userProfile.last_name = model.lastName;
                isHasUpdateData = true;
            }
            if (model.isSelectedLocation == true)
            {
                userProfile.location = model.location;
                isHasUpdateData = true;
            }
            if (model.isSelectedMaritalStatus == true)
            {
                userProfile.married_status = model.maritalStatus ? 1 : 0;
                isHasUpdateData = true;
            }
            if (model.isSelectedAvatar == true)
            {
                if (!String.IsNullOrEmpty(model.avatar.Trim()))
                {
                    userProfile.avatar = model.avatar;
                }
                isHasUpdateData = true;
            }
            if (isHasUpdateData)
                return userProfile;
            return null;
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                if (error.Contains("Name") && error.Contains("is already taken"))
                {

                }
                else
                {
                    ModelState.AddModelError("", error);
                }
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "New");
        }
        private bool CheckUserHasAdmin(List<String> listRole)
        {
            foreach (string role in listRole)
            {
                if (role.ToUpper().Trim().Equals("ADMIN"))
                    return true;
            }
            return false;
        }
        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }

        }

        [AllowAnonymous]
        public ActionResult InfoConfirmEmail()
        {
            HttpCookie cookie = Request.Cookies["username_zymi"];
            if (cookie != null)
            {
                cookie.Expires = DateTime.Now.AddDays(-1d);
                Response.Cookies.Add(cookie);
            }


            AuthenticationManager.SignOut();
            return View();
        }


        #endregion
    }
}