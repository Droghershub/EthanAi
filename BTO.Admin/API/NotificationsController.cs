using BTO.Modules;
using BTO.Service;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Http;

namespace BTO.API
{
    [RoutePrefix("api/admin-notification")]
    public class NotificationsController : BTOAPIController
    {
        public IParameterService parameterService { get; set; }

        [Route("Send")]
        [HttpPost]
        public async Task<bool>  SendNotification(JObject jsonObj)
        {
            using (var client = new HttpClient())
            {
                string BTOAppUrl = WebConfigurationManager.AppSettings["BTOAppUrl"].ToString();
                client.BaseAddress = new Uri(BTOAppUrl);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var response = await client.PostAsJsonAsync("/api/admin-notification/Send", jsonObj);
                if (response.IsSuccessStatusCode)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }
    }
}
