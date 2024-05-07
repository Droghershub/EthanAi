using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using BTO.Service;

namespace BTO.Admin
{
    public class ControllerHub : Hub
    {
        public IParameterService parameterService { get; set; }
        public void sendNotify(string parameter, string parameterId, string product_version_id)
        {
            if (GlobalConfig.parametterNeedForceUpdate.ContainsValue(parameter))
            {
                Dictionary<string, object> parameters = GlobalConfig.GetParametterNeedForceUpdate(Int32.Parse(product_version_id), parameterService);
                Clients.All.updateParameter(product_version_id, parameter, parameters[parameter]);
            }
            else if (parameter.Contains("rule_"))
            {
                Clients.All.updateParameterFormula(product_version_id, parameterId);
            }
        }
    }
}