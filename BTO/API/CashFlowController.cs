using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using BTO.Model;
using BTO.Model.Tracking;
using BTO.Service;
using BTO.Repository;
using BTO.Repository.Common;
using Moq;
using Autofac.Integration.WebApi;
using Newtonsoft.Json.Linq;
using BTO.Modules;
using BTO.Service.Tracking;
using System.Web.Script.Serialization;
using Newtonsoft.Json;
using BTO.Model.Common;
using BTO.Model.UserManagement;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.IO;
using System.Text;
using BTO.Models;

namespace BTO.API
{    

    [RoutePrefix("api/cashflow")]
    
    public class CashFlowPlanController : BTOAPIController
    {
        public IPersonaService personaService { get; set; }
        public IUserSessionService userSessionService { get; set; }
        [Route("updaterule/{id:int}")]
        [HttpGet]
        // GET api/<controller>
        public Rule UpdateRule(int id)
        {
            ConfigRule.Load(id);
            return GlobalConfig.rules[id];
        }
        [Route("getStaticRule/{id:int}")]
        [HttpGet]
        // GET api/<controller>
        public object getStaticRule(int id)
        {
            ConfigRule.Load(id);
            return 1;
        }

        [Route("delete_cashflow/{userId:guid}")]
        [HttpGet]
        // GET api/<controller>
        public string DeleteCashFlow(Guid userId)
        {
            personaService.Delete(x => x.user_id == userId);
            return string.Empty ;
        }
        
        [Route("GET/{userId:guid}/{id:int}")]
        [HttpGet]
        // GET api/<controller>
        public Rule Get(Guid userId, int id)
        {
            if (GlobalConfig.rules.ContainsKey(id))
            {
                Rule rule = GlobalConfig.rules[id];
                List<Persona> personas = personaService.GetByUserId(userId);
                foreach (Income income in rule.income)
                {
                    Persona persona = personas.Where(x => x.variable == income.name).FirstOrDefault();
                    if (persona != null)
                    {
                        income.value = (decimal)persona.value;
                    }
                    else
                        income.value = income.default_value;
                }

                foreach (Expense expense in rule.expense)
                {
                    Persona persona = personas.Where(x => x.variable == expense.name).FirstOrDefault();
                    if (persona != null)
                    {
                        expense.value = (decimal)persona.value;
                    }
                    else
                        expense.value = expense.default_value;
                }

                return rule;
            }
            else
            {
                return null;
            }
        }
        [Route("update_main_item")]
        [HttpPost]
        // GET api/<controller>
        public object UpdateMainCashFlow(Object obj)
        {
             ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
             if (client != null)
             {
                 Persona persona = new Persona();
                 JObject jsonObj = (JObject)obj;
                 if (jsonObj.GetValue("name") != null)
                     persona.variable = (string)jsonObj.GetValue("name");
                 if (jsonObj.GetValue("value") != null)
                     persona.value = (decimal)jsonObj.GetValue("value");
                 BTO.Common.WebAction.Action action = Common.WebAction.Action.CHANGE_CASH_FLOW;
                 string data = BTO.Models.Ultils.ToXML(persona);
                 userSessionService.AddUserSession(client.id, action, data);
                 
                 
             }
            return null;
            //return personaService.UpdatePersona(_persona);
        }
        [Route("update_investment_item")]
        [HttpPost]
        // GET api/<controller>
        public object UpdateinvestmentItem(Object obj)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                Persona persona = new Persona();
                JObject jsonObj = (JObject)obj;
                if (jsonObj.GetValue("name") != null)
                    persona.variable = (string)jsonObj.GetValue("name");
                if (jsonObj.GetValue("value") != null)
                    persona.value = (decimal)jsonObj.GetValue("value");
                if (jsonObj.GetValue("type") != null)
                    persona.type = (int)jsonObj.GetValue("type");
                BTO.Common.WebAction.Action action = Common.WebAction.Action.CHANGE_INVESTMENT_START;
                string data = BTO.Models.Ultils.ToXML(persona);
                userSessionService.AddUserSession(client.id, action, data);


            }
            return null;
            //return personaService.UpdatePersona(_persona);
        }
        [Route("update")]
        [HttpPost]
        // GET api/<controller>
        public object Update(List<Persona> _persona)
        {
             return personaService.UpdatePersona(_persona);
            //IList<Persona> createNew = _persona.Where(t => !personas.Select(x => x.variable).Contains(t.variable)).ToList();
            //if (createNew.Count > 0)
            //{
            //    foreach (var item in createNew)
            //    {
            //        personaService.Create(item);
            //    } 
            //}
            //IList<Persona> listChange = _persona.Where(t => personas.Select(x => new { x.variable, x.value }).Contains(new { t.variable, t.value })
            //    ).ToList();

            //if (listChange.Count > 0)
            //{
            //    foreach (var item in listChange)
            //    {
            //        personaService.Update(item);
            //    } 
            //}

            

            //Persona persona = personaService.GetByUserIdAndVariable(_persona.user_id, _persona.variable);

            //if (personas == null)
            //{
            //    personaService.Create(_persona);
            //}
            //else
            //{
            //    persona.value = _persona.value;
            //    personaService.Update(persona);
            //}
        }
       
    }
}