using BTO.Model;
using BTO.Model.Tracking;
using BTO.Modules;
using BTO.Service;
using BTO.Service.Tracking;
using System;
using System.Web;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BTO.Model.UserManagement;
using BTO.Model.Common;
using System.Web.Configuration;
using System.Collections.Specialized;
using System.Threading.Tasks;

namespace BTO.API
{
    [RoutePrefix("api/common")]
    public class CommonController : BTOAPIController
    {        
        public ICalculatorService calculatorService { get; set; }
        public IUserSessionService userSessionService { get; set; }
        [Route("calculate_engine")]
        [HttpPost]
        [RateLimit(Milliseconds = 300)]
        // POST api/<controller>
        public async Task<object> CalculateEngine(BTO.Models.CalculateModel model){
            if (String.IsNullOrEmpty(model.sessionId))
                return -1;
            string engineUrl = WebConfigurationManager.AppSettings["APIJavaEngineSchemes"].ToString() + "://" + WebConfigurationManager.AppSettings["APIJavaEngine"].ToString();
            engineUrl += "/api_calculate";

            var client = new HttpClient();
            client.DefaultRequestHeaders.TryAddWithoutValidation("ZymiApp-Token", "208EE130-BE33-41AD-AE80-6834A535630F");
            var response = await client.PostAsJsonAsync(engineUrl,model);

            var responseString = await response.Content.ReadAsStringAsync();
            return responseString;
        }
        
        [Route("calculate_basic")]
        [HttpPost]
        // POST api/<controller>
        public MainResult CalculateBasic(PersonaPlan personaPlan)
        {            
            return calculatorService.CalculatorBasic(personaPlan);
            //return mainService.CalculatorBasic(personaPlan);            
        }
        [Route("calculateAll")]
        [HttpPost]
        // POST api/<controller>
        public object calculateAll(PersonaPlan personaPlan)
        {
            return calculatorService.CalculateAll(personaPlan);
            //return mainService.CalculatorBasic(personaPlan);            
        }
        [Route("calculate_income_expense")]
        [HttpPost]
        // POST api/<controller>
        public object CalculateIncomeExpense(PersonaPlan personaPlan)
        {
            return calculatorService.CalculateIncomeExpense(personaPlan);            
        }

        [Route("calculate_equity_curve")]
        [HttpPost]
        // POST api/<controller>
        public object CalculateEquityCurve(PersonaPlan personaPlan)
        {
            return calculatorService.CalculateEquityCurve(personaPlan);
        }

        [Route("calculate_illiquid_curve")]
        [HttpPost]
        // POST api/<controller>
        public object CalculateIlliquidCurve(PersonaPlan personaPlan)
        {
            return calculatorService.CalculateIlliquidCurve(personaPlan);
        }

        [Route("calculate_ranking")]
        [HttpPost]
        // POST api/<controller>
        public BaseResponse<string[]> CalculateRanking(PersonaPlan personaPlan)
        {
            var resultReturn = new BaseResponse<string[]>();

            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.SIMULATE_RANKING_DREAM.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                resultReturn.results = null;
                resultReturn.success = false;
                resultReturn.errcode = "Don't have permission on simulate ranking!";
                return resultReturn;
            }

            List<BTO.Model.Tracking.RankingDreams> list = BTO.Model.Tracking.RankingDreams.GetListRanking(personaPlan);
            string[] result = calculatorService.CalculateRanking(personaPlan);
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.SIMULATE_RANKING_DREAM;
                string data = BTO.Models.Ultils.ToXML(list);
                userSessionService.AddUserSession(client.id, action, data);
            }  
            
            resultReturn.results = result;
            resultReturn.success = true;
            resultReturn.errcode = "";
            return resultReturn;
        }

        [Route("get_timeout")]
        [HttpGet]
        // POST api/<controller>
        public string GetTimeOut()
        {
            if (HttpContext.Current.Session["ProfileSession"] != null)
                return ((DateTime)HttpContext.Current.Session["Lastest_Access_Time"]).ToString();
            else return "null";
        }
    }
}