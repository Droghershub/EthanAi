using System;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Google;
using Owin;
using BTO.Models;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.Owin.Security.Facebook;
using Owin.Security.Providers.LinkedIn;
using Microsoft.Owin.Security.Twitter;
using Microsoft.Owin.Security;
using System.Web.Configuration;
using System.Net.Http;

namespace BTO
{
    public partial class Startup
    {
        public string FacebookAppId = WebConfigurationManager.AppSettings["FacebookAppId"].ToString();
        public string FacebookAppSecret = WebConfigurationManager.AppSettings["FacebookAppSecret"].ToString();

        public string TwitterConsumerKey = WebConfigurationManager.AppSettings["TwitterConsumerKey"].ToString();
        public string TwitterConsumerSecret = WebConfigurationManager.AppSettings["TwitterConsumerSecret"].ToString();
        //for twitter back channel
        public string VeriSignClass3CAG2 = WebConfigurationManager.AppSettings["VeriSignClass3CAG2"].ToString();
        public string VeriSignClass3CAG3 = WebConfigurationManager.AppSettings["VeriSignClass3CAG3"].ToString();
        public string VeriSignClass3AUG5 = WebConfigurationManager.AppSettings["VeriSignClass3AUG5"].ToString();
        public string SymantecClass3CAG4 = WebConfigurationManager.AppSettings["SymantecClass3CAG4"].ToString();
        public string VeriSignClass3CAG5 = WebConfigurationManager.AppSettings["VeriSignClass3CAG5"].ToString();
        public string DigiCertSHA2 = WebConfigurationManager.AppSettings["DigiCertSHA2"].ToString();
        public string DigiCertHighAssuranceEV = WebConfigurationManager.AppSettings["DigiCertHighAssuranceEV"].ToString();

        public string LinkedInClientId = WebConfigurationManager.AppSettings["LinkedInClientId"].ToString();
        public string LinkedInClientSecret = WebConfigurationManager.AppSettings["LinkedInClientSecret"].ToString();

        public string GoogleClientId = WebConfigurationManager.AppSettings["GoogleClientId"].ToString();
        public string GoogleClientSecret = WebConfigurationManager.AppSettings["GoogleClientSecret"].ToString();

        // For more information on configuring authentication, please visit http://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
            // Configure the db context, user manager and signin manager to use a single instance per request
            app.CreatePerOwinContext(ApplicationDbContext.Create);
            app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);
            app.CreatePerOwinContext<ApplicationSignInManager>(ApplicationSignInManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            // and to use a cookie to temporarily store information about a user logging in with a third party login provider
            // Configure the sign in cookie
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/Login"),
                ExpireTimeSpan = TimeSpan.FromMinutes(350),
                Provider = new CookieAuthenticationProvider
                {
                    // Enables the application to validate the security stamp when the user logs in.
                    // This is a security feature which is used when you change a password or add an external login to your account.  
                    OnValidateIdentity = SecurityStampValidator.OnValidateIdentity<ApplicationUserManager, ApplicationUser>(
                        validateInterval: TimeSpan.FromMinutes(350),
                        regenerateIdentity: (manager, user) => user.GenerateUserIdentityAsync(manager)),
                    OnApplyRedirect = ctx =>
                    {
                        if (!IsAjaxRequest(ctx.Request))
                        {
                            ctx.Response.Redirect(ctx.RedirectUri);
                        }
                    }
                }
            });

            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // Enables the application to temporarily store user information when they are verifying the second factor in the two-factor authentication process.
            app.UseTwoFactorSignInCookie(DefaultAuthenticationTypes.TwoFactorCookie, TimeSpan.FromMinutes(5));

            // Enables the application to remember the second login verification factor such as phone or email.
            // Once you check this option, your second step of verification during the login process will be remembered on the device where you logged in from.
            // This is similar to the RememberMe option when you log in.
            app.UseTwoFactorRememberBrowserCookie(DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie);

            // Uncomment the following lines to enable logging in with third party login providers
            //app.UseMicrosoftAccountAuthentication(
            //    clientId: "",
            //    clientSecret: "");

            //app.UseTwitterAuthentication(
            //   consumerKey: "",
            //   consumerSecret: "");

            //app.UseFacebookAuthentication(
            //   appId: "",
            //   appSecret: "");

            app.UseTwitterAuthentication(new TwitterAuthenticationOptions
            {
                ConsumerKey = TwitterConsumerKey,
                ConsumerSecret = TwitterConsumerSecret,
                BackchannelCertificateValidator = new CertificateSubjectKeyIdentifierValidator(
                new[]
                {
                    VeriSignClass3CAG2, // VeriSign Class 3 Secure Server CA - G2
                    VeriSignClass3CAG3, // VeriSign Class 3 Secure Server CA - G3
                    VeriSignClass3AUG5, // VeriSign Class 3 Public Primary Certification Authority - G5
                    SymantecClass3CAG4, // Symantec Class 3 Secure Server CA - G4
                    VeriSignClass3CAG5, // VeriSign Class 3 Primary CA - G5
                    DigiCertSHA2, // DigiCert SHA2 High Assurance Server C‎A 
                    DigiCertHighAssuranceEV // DigiCert High Assurance EV Root CA
                }),
                Provider = new TwitterAuthenticationProvider
                {
                    OnAuthenticated = async context =>
                    {
                        // Retrieve the OAuth access token to store for subsequent API calls                        
                        context.Identity.AddClaim(new Claim("urn:tokens:twitter:accessToken", context.AccessToken));
                        context.Identity.AddClaim(new Claim("urn:tokens:twitter:accessTokenSecret", context.AccessTokenSecret));
                        // Retrieve the screen name (e.g. @jerriepelser)
                        string twitterScreenName = context.ScreenName;

                        // Retrieve the user ID
                        var twitterUserId = context.UserId;

                    }
                }
            });

            var x = new FacebookAuthenticationOptions();
            x.Scope.Add("email");
            x.AppId = FacebookAppId;
            x.AppSecret = FacebookAppSecret;
            x.BackchannelHttpHandler = new FacebookBackChannelHandler();
            x.UserInformationEndpoint = "https://graph.facebook.com/v2.7/me?fields=id,name,email,first_name,last_name,location";
            x.Provider = new FacebookAuthenticationProvider()
            {
                OnAuthenticated = context =>
                {
                    context.Identity.AddClaim(new System.Security.Claims.Claim("FacebookAccessToken", context.AccessToken));
                    foreach (var claim in context.User)
                    {
                        var claimType = string.Format("urn:facebook:{0}", claim.Key);
                        string claimValue = claim.Value.ToString();
                        if (!context.Identity.HasClaim(claimType, claimValue))
                            context.Identity.AddClaim(new System.Security.Claims.Claim(claimType, claimValue, "XmlSchemaString", "Facebook"));
                    }
                    return System.Threading.Tasks.Task.FromResult(true);
                }
            };
            x.SignInAsAuthenticationType = DefaultAuthenticationTypes.ExternalCookie;
            app.UseFacebookAuthentication(x);
            app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
            {
                ClientId = GoogleClientId,
                ClientSecret = GoogleClientSecret,
                Provider = new Microsoft.Owin.Security.Google.GoogleOAuth2AuthenticationProvider
                {
                    OnAuthenticated = async context =>
                {
                    foreach (var claim in context.User)
                    {
                        var claimType = string.Format("urn:tokens:google:{0}", claim.Key);
                        string claimValue = claim.Value.ToString();
                        if (!context.Identity.HasClaim(claimType, claimValue))
                            context.Identity.AddClaim(new System.Security.Claims.Claim(claimType, claimValue, "XmlSchemaString", "Google"));
                    }
                }


                }
            });

            //  LinkedInAuthenticationExtensions.UseLinkedInAuthentication(this Owin.IAppBuilder, Owin.Security.Providers.LinkedIn.LinkedInAuthenticationOptions)
            var options = new LinkedInAuthenticationOptions
            {
                ClientId = LinkedInClientId,
                ClientSecret = LinkedInClientSecret,
                Provider = new LinkedInAuthenticationProvider
                {
                    OnAuthenticated = async context =>
                    {

                        context.Identity.AddClaim(new Claim("LinkedIn:Email", context.Email));
                        context.Identity.AddClaim(new Claim("LinkedIn:UserName", context.UserName));
                        context.Identity.AddClaim(new Claim("LinkedIn:FirstName", context.User.GetValue("firstName").ToString()));
                        context.Identity.AddClaim(new Claim("LinkedIn:LastName", context.User.GetValue("lastName").ToString()));
                        context.Identity.AddClaim(new Claim("LinkedIn:AccessToken", context.AccessToken));
                    }
                }
            };
            app.UseLinkedInAuthentication(options);
        }
        private static bool IsAjaxRequest(IOwinRequest request)
        {
            IReadableStringCollection query = request.Query;
            if ((query != null) && (query["X-Requested-With"] == "XMLHttpRequest"))
            {
                return true;
            }
            IHeaderDictionary headers = request.Headers;
            return ((headers != null) && (headers["X-Requested-With"] == "XMLHttpRequest"));
        }
    }

    public class FacebookBackChannelHandler : HttpClientHandler
    {
        protected override async System.Threading.Tasks.Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
        {
            if (!request.RequestUri.AbsolutePath.Contains("/oauth"))
            {
                request.RequestUri = new Uri(request.RequestUri.AbsoluteUri.Replace("?access_token", "&access_token"));
            }
            return await base.SendAsync(request, cancellationToken);
        }
    }
}