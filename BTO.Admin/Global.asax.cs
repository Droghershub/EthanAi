using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Autofac.Integration.Mvc;
using Autofac.Integration.WebApi;
using Autofac;
using BTO.Modules;
using BTO.Model;
using System.Data.Entity;
using System.IdentityModel.Services;
using BTO.Common;

namespace BTO.Admin
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            Database.SetInitializer<BTOContext>(null);

            IdentityConfig.ConfigureIdentity();

            var builder = new Autofac.ContainerBuilder();

            //builder.RegisterHubs(Assembly.GetExecutingAssembly());


            builder.RegisterControllers(typeof(MvcApplication).Assembly).PropertiesAutowired();
            builder.RegisterApiControllers(typeof(MvcApplication).Assembly).PropertiesAutowired();
            builder.RegisterModule(new RepositoryModule());
            builder.RegisterModule(new ServiceModule());
            builder.RegisterModule(new EFModule());



            var container = builder.Build();
            DependencyResolver.SetResolver(new Autofac.Integration.Mvc.AutofacDependencyResolver(container));
            GlobalConfiguration.Configuration.DependencyResolver = new Autofac.Integration.WebApi.AutofacWebApiDependencyResolver(container);
            Mail.initEmailTemplate();
            /*GlobalHost.DependencyResolver = new Autofac.Integration.SignalR.AutofacDependencyResolver(container);
            GlobalHost.Configuration.ConnectionTimeout = TimeSpan.FromSeconds(180);

            GlobalHost.Configuration.DisconnectTimeout = TimeSpan.FromSeconds(60);
             */
        }

        private void WSFederationAuthenticationModule_RedirectingToIdentityProvider(object sender, RedirectingToIdentityProviderEventArgs e)
        {
            if (!String.IsNullOrEmpty(IdentityConfig.Realm))
            {
                e.SignInRequestMessage.Realm = IdentityConfig.Realm;
            }
        }
        protected void Application_PostAuthorizeRequest()
        {

            if (IsWebApiRequest())
            {
                HttpContext.Current.SetSessionStateBehavior(System.Web.SessionState.SessionStateBehavior.Required);
            }
        }
        private static bool IsWebApiRequest()
        {
            return HttpContext.Current.Request.AppRelativeCurrentExecutionFilePath.StartsWith(String.Format("~/{0}", "api"));
        }


    }
}
