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
using Microsoft.AspNet.SignalR;
using System.Reflection;



using Autofac.Integration.SignalR;

using Microsoft.Owin;
using Owin;
using BTO.Service;
using BTO.ShareScreen;
using BTO.Common;
using BTO.Models;
using BTO.Service.Tracking;
using BTO.Model.Tracking;

namespace BTO
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            //Autofac Configuration 
         //   BundleTable.EnableOptimizations = true;
            Database.SetInitializer<BTOContext>(null);
            var builder = new Autofac.ContainerBuilder();

            builder.RegisterHubs(Assembly.GetExecutingAssembly());
            

            builder.RegisterControllers(typeof(MvcApplication).Assembly).PropertiesAutowired();
            builder.RegisterApiControllers(typeof(MvcApplication).Assembly).PropertiesAutowired();
            builder.RegisterModule(new RepositoryModule());
            builder.RegisterModule(new ServiceModule());
            builder.RegisterModule(new EFModule());

            

            var container = builder.Build();
            DependencyResolver.SetResolver(new Autofac.Integration.Mvc.AutofacDependencyResolver(container));
            GlobalConfiguration.Configuration.DependencyResolver = new Autofac.Integration.WebApi.AutofacWebApiDependencyResolver(container);
            
            GlobalHost.DependencyResolver = new Autofac.Integration.SignalR.AutofacDependencyResolver(container);


            GlobalHost.Configuration.ConnectionTimeout = TimeSpan.FromSeconds(180);
            
            GlobalHost.Configuration.DisconnectTimeout = TimeSpan.FromSeconds(60);

            GlobalHost.Configuration.KeepAlive = TimeSpan.FromSeconds(20);

            Mail.initEmailTemplate();

            //var connectionService = DependencyResolver.Current.GetService<IConnectionService>();
            //connectionService.DeleteAllConnection();
            MultiLanguage.LoadLanguage();
            //Load config rule
            //ConfigRule.Load(1);

            
        }
        protected void Application_Error(object sender, EventArgs e)
        {
            Exception exception = Server.GetLastError();
            Server.ClearError();

            var exceptionService = DependencyResolver.Current.GetService<ILogExceptionService>();
            LogException log = new LogException()
            {
                level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                Type = "",
                user_id = Guid.Empty,
                time_create = DateTime.Now,
                message = exception.Message + " " + exception.InnerException 
            };
            exceptionService.AddLog(log);

            Response.Redirect("/Home/Error");
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
