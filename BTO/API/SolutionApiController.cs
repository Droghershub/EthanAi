using BTO.Model;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Modules;
using BTO.Service;
using BTO.Service.Tracking;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BTO.Service.Profile;
using BTO.Model.Profile;
using System.Web;
using BTO.Model.UserManagement;
using BTO.Model.Common;

namespace BTO.API
{ 
    [RoutePrefix("api/Solution")]   
    public class SolutionApiController : BTOAPIController
    {
        public ICalculatorService calculatorService { get; set; }
        public ISolutionService solutionService { get; set; }
        public IPersonaPlanService personalPlanService { get; set; }
        
        public IUserSessionService userSessionService { get; set; }
        [Route("GET/{user_id:guid}")]
        // GET api/<controller>
        public object Get(Guid user_id)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
                return null;

            List<Solution> list = solutionService.GetByUserId(user_id);
            BTO.Common.WebAction.Action action = Common.WebAction.Action.MANAGE_SOLUTION;

            string data = BTO.Common.Utils.ToXML(list);
            userSessionService.AddUserSession(client.id, action, data);            
            return list;
        }
        [Route("DeleteList")]
        [HttpPost]
        public BaseResponse<bool> DeleteList(int[] listInput)
        {
            var result = new BaseResponse<bool>();

            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.DELETE_SOLUTION.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = false;
                result.success = false;
                result.errcode = "Deleting solution is not permitted";
                return result;
            }

            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
            {
                result.results = false;
                result.success = false;
                result.errcode = "";
                return result;
            }   
            var ob = solutionService.DeleteByList(listInput); ;
            SolutionModel md = new SolutionModel()
            {
                id = listInput[0],
                time_create = DateTime.Now
            };
            BTO.Common.WebAction.Action action = Common.WebAction.Action.DELETE_SOLUTION;

            string data = BTO.Common.Utils.ToXML(md);
            userSessionService.AddUserSession(client.id, action, data);

            result.results = ob;
            result.success = true;            
            return result;
            
        }
        [Route("UpdateName")]
        [HttpPost]
        public BaseResponse<bool> UpdateName(Solution item)
        {
            var result = new BaseResponse<bool>();

            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.RENAME_SOLUTION.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = false;
                result.success = false;
                result.errcode = "Renaming solution is not permitted";
                return result;
            }

            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
            {
                result.results = false;
                result.success = false;
                result.errcode = "";
                return result;
            }   

             Solution solution = solutionService.GetById(item.id);
             if (solution != null)
             {
                 solution.name = item.name;
                 solutionService.Update(solution);
                 SolutionModel md = new SolutionModel() { 
                     id = solution.id,
                     name = solution.name,
                     time_create = DateTime.Now
                 };
                 BTO.Common.WebAction.Action action = Common.WebAction.Action.RENAME_SOLUTION;

                 string data = BTO.Common.Utils.ToXML(md);
                 userSessionService.AddUserSession(client.id, action, data);
                 result.results = true;
                 result.success = true;
                 result.errcode = "";
                 return result;
             }
             result.results = false;
             result.success = false;
             result.errcode = "";
             return result;
        }

        [Route("Savesolution")]
        [HttpPost]
        public BaseResponse<List<Solution>> Save(Solution item)
        {
            var result = new BaseResponse<List<Solution>>();

            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.SAVE_SOLUTION.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Saving soluting is not permitted";
                return result;
            }

            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
            {
                result.results = null;
                result.success = false;
                result.errcode = "";
                return result;
            }               
           
            if ("Automatic".Equals(item.type))
            {
                item.name = "Automatic Backup " + item.version;
                item.type = "Automatic";
            }
            else
            {
                if(item.name.Equals(""))
                {
                    item.name = "Manual Backup " + item.version;
                } 
                item.type = "Manual";
            }
            
            item.time_create = DateTime.Now;
            Solution bol = solutionService.SaveSolution(item);
            if (item.type.Equals("Manual"))
            {
                SolutionModel md = new SolutionModel() {
                    id = bol.id,
                    name = item.name,
                    user_id = item.user_id.ToString(),                    
                    type = item.type,
                    time_create = DateTime.Now
                };
                string dataxml = BTO.Common.Utils.ToXML(md);
                BTO.Common.WebAction.Action action = Common.WebAction.Action.SAVE_SOLUTION;

                userSessionService.AddUserSession(client.id, action, dataxml);

                result.results = solutionService.GetByUserId(item.user_id);
                result.success = true;
                result.errcode = "";

                return result;
            }
            result.results = null;
            result.success = false;
            result.errcode = "";
            return result;
           
        }
         
        [Route("Loadsolution")]
        [HttpPost]
        public BaseResponse<Guid> LoadSolution(object obj)
        {
            var result = new BaseResponse<Guid>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.LOAD_SOLUTION.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = Guid.Empty;
                result.success = false;
                result.errcode = "Loading solution is not permitted";
                return result;
            }

            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
            {
                result.results = Guid.Empty;
                result.success = false;
                result.errcode = string.Empty;
                return result;
            }
                
            int solutionId = int.Parse(obj.ToString().Trim());
           
            PersonaPlan currentPlan = personalPlanService.LoadSaveSolution(solutionId);
            SolutionModel md = new SolutionModel()
            {
                id = solutionId,
                currentPlan = PersonalPlanModel.Copy(currentPlan),//currentplanmd,
                time_create = DateTime.Now
            };
            string dataxml = BTO.Common.Utils.ToXML(md);
            BTO.Common.WebAction.Action action = Common.WebAction.Action.LOAD_SOLUTION;

            userSessionService.AddUserSession(client.id, action, dataxml);

            result.results = currentPlan.user_id;
            result.success = true;            
            return result;

        }
        [Route("SaveAutomatic")]
        [HttpPost]
        public object SaveAutomatic(object obj)
        {
          //  Guid user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(this.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString(), 0));
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
                return "";
            var json = JObject.Parse(obj.ToString());
            var str = (string)json["user_id"];
            if (string.IsNullOrEmpty(str))
                return string.Empty;
            Guid user_id = Guid.Parse(str.ToString().Trim());
            
            string returnvalue = "" ; 
            if ((DateTime.Now - (DateTime)client.time_update).TotalMinutes >= 10)
            {
                returnvalue = this.Save(new Solution()
                {
                    name = "Automatic Backup",
                    number = 1,
                    time_create = DateTime.Now,
                    type = "Automatic",
                    user_id = user_id,
                }).ToString();

                client.time_update = DateTime.Now;
                HttpContext.Current.Session.Add("ProfileSession", client);                
            }
            
            return returnvalue;

        }
        [Route("CloseSolution")]
        [HttpPost]
        public object CloseSolution()
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                string dataxml = String.Empty;
                BTO.Common.WebAction.Action action = Common.WebAction.Action.CLOSE_SOLUTION;
                userSessionService.AddUserSession(client.id, action, dataxml);                
            }
                
            return null;
        }
    }
}
