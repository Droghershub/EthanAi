using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
using System.Web.Configuration;

//[assembly: OwinStartupAttribute(typeof(BTO.Admin.Startup))]
namespace BTO.Admin
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            GlobalHost.DependencyResolver.UseRedis(WebConfigurationManager.AppSettings["Redis_Server"].ToString(), int.Parse(WebConfigurationManager.AppSettings["Redis_Port"].ToString()), WebConfigurationManager.AppSettings["Redis_Password"].ToString(), WebConfigurationManager.AppSettings["Redis_EventKey"].ToString());
            app.MapSignalR();
        }
    }
}
