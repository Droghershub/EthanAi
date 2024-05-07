using BTO.Common;
using BTO.Model;
using BTO.Modules;
using BTO.Service;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using BTO.Models;
using System.Web.Script.Serialization;
using System.Runtime.Serialization.Json;
using System.IO;
using System.Text;
using System.Xml.Linq;
using System.Web.Configuration;
namespace BTO.API
{
    [Authorize(Roles = "Admin")]
    [RoutePrefix("api/parameter")]
    public class ParameterController : BTOAPIController
    {
        public IParameterService parameterService { get; set; }
        public IListItemService listItemService { get; set; }
        public IProductVersionService productVersionService { get; set; }

        [Route("{product_version_id}")]
        //public List<ListItem> GetListParameter(JObject data)
        public List<Parameter> GetListParameter(int product_version_id)
        {            
            List<Parameter> parameters = parameterService.GetByProductVersionId(product_version_id);
            return parameters;
        }

        [Route("UpdateParameter")]
        [HttpPost]
        public object UpdateParameter(Parameter dataInput)
        {
            //Parameter data = parameterService.GetById(dataInput.id);
            if (dataInput.type == CommonTypes.PARAMETER_SIMPLE)
            {
                Parameter param = parameterService.GetById(dataInput.id);
                param.default_value = dataInput.default_value;
                param.description = dataInput.description;
                param.max_value = dataInput.max_value;
                param.min_value = dataInput.min_value;
                param.format_number = dataInput.format_number;
                parameterService.Update(param);
                GlobalConfig.UpdateParametterNeedForceUpdate(dataInput.product_version_id, parameterService);
            }
            else if (dataInput.type == CommonTypes.PARAMETER_LIST)
            {
                try { 
                    var obj= parameterService.UpdateParameterTypeList(dataInput, listItemService);
                    GlobalConfig.UpdateParametterNeedForceUpdate(dataInput.product_version_id, parameterService);
                    return obj;
                }
                catch (Exception ex)
                {
                    if (ex.InnerException.InnerException.Message.Contains("duplicate key value"))
                        return "duplicate name";
                    else
                        return "error";
                }
                
            }
            
            
            return Ok();
        }
        [Route("UpdateTreeParameter")]
        [HttpPost]
        public object UpdateTreeParameter(Parameter dataInput)
        {
            try
            {
                var obj = parameterService.UpdateTree(dataInput);
                Rule rule = GlobalConfig.getRuleFromDB(dataInput.product_version_id, parameterService);
                if (GlobalConfig.rules.ContainsKey(dataInput.product_version_id))
                    GlobalConfig.rules[dataInput.product_version_id] = rule;
                else
                    GlobalConfig.rules.Add(dataInput.product_version_id, rule);
                return obj;
            }
            catch (Exception ex)
            {
                if (ex.InnerException.InnerException.Message.Contains("duplicate key value"))
                    return "duplicate name";
                else
                    return "error";
            }
            return parameterService.UpdateTree(dataInput);            
        }
        [Route("CreateParameter")]
        [HttpPost]
        public object CreateParameter(Parameter data)
        {
            try
            {
                data.deleteable = true;
                parameterService.Create(data);
                Rule rule = GlobalConfig.getRuleFromDB(data.product_version_id, parameterService);
                if (GlobalConfig.rules.ContainsKey(data.product_version_id))
                    GlobalConfig.rules[data.product_version_id] = rule;
                else
                    GlobalConfig.rules.Add(data.product_version_id, rule);
                return data;
            }
            catch (Exception ex)
            {
                if (ex.InnerException.InnerException.Message.Contains("duplicate key value"))
                    return "duplicate name";
                else 
                    return "error";
            }
            
        }

        [Route("DeleteParameter")]
        [HttpPost]
        public object DeleteParameter(object _id)
        {
            int id = Convert.ToInt32(_id);
            parameterService.DeleteTopParentId(id);
            //Parameter data = parameterService.GetById(id);
            //parameterService.Delete(data);
            return Ok();
        }
        [AllowAnonymous]
        [Route("get_list_item_of_parameter")]
        [HttpGet]
        public object GetListParameter()       
        {
            string user_id = HttpContext.Current.User.Identity.GetUserId();
            if (!String.IsNullOrEmpty(user_id))
                return listItemService.GetListItemsForUser(user_id);
            List<ListItem> items = listItemService.GetByParameterOfDefault();
            return items;
        }
        [AllowAnonymous]
        [Route("get_parameter")]
        [HttpGet]
        public List<Parameter> GetParameter()
        {
            string user_id = HttpContext.Current.User.Identity.GetUserId();
            if (!String.IsNullOrEmpty(user_id))
                return parameterService.GetParametersForUser(user_id);
            List<Parameter> items = parameterService.GetDefault();
            return items;
        }
        [AllowAnonymous]
        [Route("get_parameter_profile")]
        [HttpGet]
        public List<Parameter> GetParameterForProfile()
        {
            string user_id = HttpContext.Current.User.Identity.GetUserId();
            if (!String.IsNullOrEmpty(user_id))
                return parameterService.GetParametersForUserProfile(user_id);
            List<Parameter> items = parameterService.GetDefault();
            return items;
        }
        [Route("get_detail_parameter/{id}")]
        [HttpGet]
        public List<Parameter> GetDetailParameter(int id)
        {          
            Parameter data = parameterService.GetById(id);
            List<Parameter> list = new List<Parameter>();
            list.Add(data);
            if (data != null && data.type == CommonTypes.PARAMETER_SIMPLE)
            {
                return list;

            }
            else if (data != null && data.type == CommonTypes.PARAMETER_LIST)
            {
                List<ListItem> items = listItemService.GetByParameterId(data.id).ToList();
                return list;
            }
            else if (data != null && data.type == CommonTypes.PARAMETER_TREE)
            {               
                return parameterService.GetByTopParentId(id);
            }
            return null;
        }
        [Route("CloneProductVersion")]
        [HttpPost]
        public object CloneProductVersion(ProductVersionMapping cloneVersion)
        {
            return productVersionService.CloneProductVersion(cloneVersion);            
        }

        public static void GetParametterFromCPF(BTO.Models.CPF cpf, string parent, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList)
        {
            name_value_parametterList.Add(cpf.name, cpf.default_value.ToString());
            name_parent_parametterList.Add(cpf.name, parent);
            name_issum_parametterList.Add(cpf.name, cpf.isSummable.ToString());
            name_isformular_parametterList.Add(cpf.name, cpf.isFormula.ToString());
            if (cpf.children != null && cpf.children.Count > 0)
            {
                foreach (CPF childCPF in cpf.children)
                {
                    GetParametterFromCPF(childCPF, cpf.name, name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
                }
            }
        }

        public static void GetParametterFromIncome(Income income, string parent, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList)
        {
            if (name_value_parametterList.ContainsKey(income.name))
                return;
            name_value_parametterList.Add(income.name, income.default_value.ToString());
            name_parent_parametterList.Add(income.name, parent);
            name_issum_parametterList.Add(income.name, income.isSummable.ToString());
            name_isformular_parametterList.Add(income.name, income.isFormula.ToString());
            if (income.children != null && income.children.Count > 0)
            {
                foreach (Income childIncome in income.children)
                {
                    GetParametterFromIncome(childIncome, income.name, name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
                }
            }
        }

        public static void GetParametterFromExpense(Expense expense, string parent, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList)
        {
            name_value_parametterList.Add(expense.name, expense.default_value.ToString());
            name_parent_parametterList.Add(expense.name, parent);
            name_issum_parametterList.Add(expense.name, expense.isSummable.ToString());
            name_isformular_parametterList.Add(expense.name, expense.isFormula.ToString());
            if (expense.children != null && expense.children.Count > 0)
            {
                foreach (Expense childExpense in expense.children)
                {
                    GetParametterFromExpense(childExpense, expense.name, name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
                }
            }
        }

        [Route("SaveRuleFileToCurrentVersion")]
        [HttpPost]
        public object SaveRuleFileToCurrentVersion(ProductVersionMapping version)
        {
            string APIJavaEngine = "https://"+WebConfigurationManager.AppSettings["APIJavaEngine"].ToString() + "/getRuleConfig?nationallity=1";
            var syncClient = new WebClient();
            Rule data = null;
            var content = syncClient.DownloadString(APIJavaEngine);


            JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
            var jsonObject = javaScriptSerializer.Deserialize<dynamic>(content);
            dynamic parameter = (dynamic)jsonObject["parameter"];


            DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(Rule));
            data = new Rule();
            using (var ms = new MemoryStream(Encoding.Unicode.GetBytes(content)))
            {
                // deserialize the JSON object using the WeatherData type.
                data = (Rule)serializer.ReadObject(ms);
                data.parameter = (Dictionary<string, object>)parameter;
            }

            Dictionary<string, string> name_value_parametterList = new Dictionary<string,string>();
            Dictionary<string, string> name_parent_parametterList = new Dictionary<string, string>();
            Dictionary<string, string> name_issum_parametterList = new Dictionary<string, string>();
            Dictionary<string, string> name_isformular_parametterList = new Dictionary<string, string>();

            name_value_parametterList.Add("cpf","0");
            name_parent_parametterList.Add("cpf", null);
            name_issum_parametterList.Add("cpf", "true");
            name_isformular_parametterList.Add("cpf", "true");
            foreach (CPF cpf in data.cpf)
            {
                GetParametterFromCPF(cpf, "cpf", name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
            }

            name_value_parametterList.Add("income", "0");
            name_parent_parametterList.Add("income", null);
            name_issum_parametterList.Add("income", "true");
            name_isformular_parametterList.Add("income", "true");
            foreach (Income income in data.income)
            {
                GetParametterFromIncome(income, "income", name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
            }

            name_value_parametterList.Add("expense", "0");
            name_parent_parametterList.Add("expense", null);
            name_issum_parametterList.Add("expense", "true");
            name_isformular_parametterList.Add("expense", "true");
            foreach (Expense expense in data.expense)
            {
                GetParametterFromExpense(expense, "expense", name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
            }

            name_value_parametterList.Add("investment_start", "0");
            name_parent_parametterList.Add("investment_start", null);
            name_issum_parametterList.Add("investment_start", "true");
            name_isformular_parametterList.Add("investment_start", "true");
            foreach (Income invest in data.investment_start)
            {
                GetParametterFromIncome(invest, "investment_start", name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
            }

            name_value_parametterList.Add("parameter", "0");
            name_parent_parametterList.Add("parameter", null);
            name_issum_parametterList.Add("parameter", "true");
            name_isformular_parametterList.Add("parameter", "true");
            foreach (Income parameterconfig in data.parameter_config)
            {
                GetParametterFromIncome(parameterconfig, "parameter", name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
            }


            //foreach (var pair in data.parameter)
            //{
            //    if (name_value_parametterList.ContainsKey(pair.Key))
            //        continue;
            //    name_value_parametterList.Add(pair.Key, pair.Value.ToString());
            //    name_parent_parametterList.Add(pair.Key, "parameter");
            //    name_issum_parametterList.Add(pair.Key, "true");
            //    name_isconstant_parametterList.Add(pair.Key, "true");
            //}

            parameterService.UpdateParameterFromRule(version.clone_from_id, name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);

            Rule rule = GlobalConfig.getRuleFromDB(version.clone_from_id, parameterService);
            if (GlobalConfig.rules.ContainsKey(version.clone_from_id))
                GlobalConfig.rules[version.clone_from_id] = rule;
            else
                GlobalConfig.rules.Add(version.clone_from_id, rule);

            return name_value_parametterList;
        }

        private void Recursion(List<Parameter> list, Parameter parameter)
        {
            list.Add(parameter);
            List<Parameter> items = parameterService.GetByParentId(parameter.id);
            foreach(Parameter item in items)
            {
                Recursion(list, item);
            }
        }

    }
}