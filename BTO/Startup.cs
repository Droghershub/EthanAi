using Autofac;
using Autofac.Integration.SignalR;
using BTO.Model;
using BTO.Models;
using BTO.Modules;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
using System.Data.Entity;
using System.Reflection;

[assembly: OwinStartupAttribute(typeof(BTO.Startup))]
[assembly: OwinStartup(typeof(BTO.Startup))]
namespace BTO
{
    
    public partial class Startup
    {

        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            //app.MapSignalR();

            var builder = new ContainerBuilder();

            // STANDARD SIGNALR SETUP:

            // Get your HubConfiguration. In OWIN, you'll create one
            // rather than using GlobalHost.
            var config = new HubConfiguration();
            config.EnableJavaScriptProxies = true;
            // Register your SignalR hubs.
            builder.RegisterHubs(Assembly.GetExecutingAssembly());                      

            builder.RegisterType(typeof(BTOContext)).As(typeof(DbContext)).InstancePerLifetimeScope();
            builder.RegisterType(typeof(UnitOfWork)).As(typeof(IUnitOfWork)).InstancePerLifetimeScope();

            builder.RegisterModule(new RepositoryModule());
            builder.RegisterModule(new ServiceModule());
            
            // Set the dependency resolver to be Autofac.
            var container = builder.Build();
           // config.Resolver = new Autofac.Integration.SignalR.AutofacDependencyResolver(container);

            GlobalHost.DependencyResolver = new Autofac.Integration.SignalR.AutofacDependencyResolver(container);
            // OWIN SIGNALR SETUP:

            // Register the Autofac middleware FIRST, then the standard SignalR middleware.
            //app.UseAutofacMiddleware(container);

            GlobalHost.DependencyResolver.UseRedis(Ultils.GetValueByKeyFromConfig("Redis_Server"), int.Parse(Ultils.GetValueByKeyFromConfig("Redis_Port")), Ultils.GetValueByKeyFromConfig("Redis_Password"), Ultils.GetValueByKeyFromConfig("Redis_EventKey"));
            app.MapSignalR("/signalr", config); 
        }
    }
}
