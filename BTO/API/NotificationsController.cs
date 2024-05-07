using BTO.Modules;
using BTO.Service;
using BTO.ShareScreen;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BTO.API
{
    [RoutePrefix("api/admin-notification")]
    [BTOAPIAdminFilter]
    public class NotificationsController : ApiController
    {
        public IParameterService parameterService { get; set; }
        [Route("Send")]
        [HttpPost]
        public void SendNotification(JObject jsonObj)
        {
            string parameter = String.Empty, parameterId = String.Empty, product_version_id = String.Empty;
            if (jsonObj.GetValue("parameter") != null)
                parameter = (string)jsonObj.GetValue("parameter");
            if (jsonObj.GetValue("parameterId") != null)
                parameterId = (string)jsonObj.GetValue("parameterId");
            if (jsonObj.GetValue("product_version_id") != null)
                product_version_id = (string)jsonObj.GetValue("product_version_id");
            var hub = GlobalHost.ConnectionManager.GetHubContext<ControllerHub>(); 
            if (GlobalConfig.parametterNeedForceUpdate.ContainsValue(parameter))
            {
                Dictionary<string, object> parameters = GlobalConfig.GetParameterForNotification(Int32.Parse(product_version_id), parameterService);
                var paramValue = parameters[parameter];
                hub.Clients.All.updateParameter(product_version_id, parameter, paramValue);
            }
            else if (parameter.Contains("rule_"))
            {
                hub.Clients.All.updateParameterFormula(product_version_id, parameterId);
            }
        }
    }
}
