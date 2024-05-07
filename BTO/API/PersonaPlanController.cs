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
using BTO.Models;
using Microsoft.AspNet.Identity;

namespace BTO.API
{
    [RoutePrefix("api/PersonaPlan")]
    public class PersonaPlanController : BTOAPIController
    {
        public IParameterService parameterService { get; set; }
        public IListItemService listItemService { get; set; }
        public IPersonaPlanService personaPlanService { get; set; }
        public ICalculatorService calculatorService { get; set; }
        public IDreamService dreamService { get; set; }
        public IDreamTypeService dreamTypeService { get; set; }
        public ILifeEventService lifeEventService { get; set; }
        public IUserSessionService userSessionService { get; set; }
        public IPersonaService personaService { get; set; }
        public IOrganizationUnitUserService _organizationUnitUserService { get; set; }
        public IUserProfileService userProfileService { get; set; }
        public IProductVersionService _productVersionService { get; set; }
        [Route("GET/{user_id:guid}")]
        // GET api/<controller>
        public BTO.Models.BasicResult Get(Guid user_id)
        {            
            //List<PersonaPlan> personaPlan = personaPlanService.GetByGuid(user_id);
            PersonaPlan personaPlan = personaPlanService.GetCurrentPlanByUserId(user_id);
            ProductVersion _prversion = _productVersionService.GetByUserId(user_id.ToString());
            int status = -2;            
            if (personaPlan == null )
            {
                UserProfile user = userProfileService.GetByUserId(user_id);
                
                status = 0;
                personaPlanService.InsertDefaultPersonaPlan(user_id.ToString(), status);
                personaPlan = personaPlanService.GetCurrentPlanByUserId(user_id);
                Dictionary<string, object> parameter = GlobalConfig.GetParameter(_prversion.id, parameterService);
                int _c_age_main = Convert.ToInt32(parameter["_c_age_main"]);
                int _c_retirement_main = Convert.ToInt32(parameter["_c_retirement_main"]);
                int age_payout_main = Convert.ToInt32(parameter["age_payout_main"]);
            

                personaPlan.start_age = _c_age_main;
                personaPlan.retirement_age = _c_retirement_main;
                personaPlan.social_security_age = age_payout_main;
                    
                

                //----------------------
                List<Parameter> parameters = parameterService.GetParametersForUser(user_id.ToString());
               // PersonaPlan current = personaPlan.Where(x => x.status == ScenarioType.Current).FirstOrDefault();
                int _c_dwelling_type = Convert.ToInt32(parameter["_c_dwelling_type"]);
                Dream defaultDream = new Dream();
                defaultDream.residential_type = _c_dwelling_type;
                defaultDream.dream_type_id = 1;
                defaultDream.persona_plan_id = personaPlan.id;
                defaultDream.name = "Residence purchase 1";
                Parameter total_cost_parameter = parameters.Where(x => x.name == "dream.residence_purchase.total_cost").SingleOrDefault();
                if (total_cost_parameter != null)
                    defaultDream.total_cost = Decimal.Parse(total_cost_parameter.default_value);
                else
                    defaultDream.total_cost = 0;

                defaultDream.purchase_age = user.age;
                defaultDream.payment_duration = Math.Min(60 - _c_age_main, 25);
                defaultDream.down_payment = defaultDream.total_cost * (defaultDream.payment_duration / 25);
                defaultDream.mortage_interest_rate = 0.15m;
                defaultDream.rental_net_income = 0;
                defaultDream.yearly_expenses = 0;
                defaultDream.is_absolute_dream_down_payment = true;

                defaultDream.transaction_cost = 0;
                defaultDream.existant = true;
                defaultDream.is_rent = false;
                defaultDream.is_living = false;
                DreamType type = dreamTypeService.GetById(defaultDream.dream_type_id);

                defaultDream.dream_type = type;
                Parameter property_type_parameter = parameters.Where(x => x.name == "dream.residence_purchase.property_type").SingleOrDefault();
                if (property_type_parameter != null)
                {
                    List<ListItem> items = listItemService.GetByParameterId(property_type_parameter.id).ToList();
                    ListItem item = items.Where(x => x.value == _c_dwelling_type.ToString()).SingleOrDefault();
                    if (item != null)
                        defaultDream.name = item.name;
                }
                personaPlan.dreams.Add(defaultDream);

                personaPlan.start_age = user.age;
                this.initChildIndependent(personaPlan, user, parameter);

                personaPlanService.Update(personaPlan);

            }
          
            MainResult mainResult = new MainResult();
           
            BTO.Models.BasicResult returnObject = new BTO.Models.BasicResult()

            {
                currentplan =personaPlan,// personaPlan.Where(t => t.status == Model.Common.ScenarioType.Current).FirstOrDefault(),
               
                result = mainResult
            };
            
            GlobalConfig.ForceUpdateParameter(returnObject.currentplan, _prversion.id, parameterService);
            //GlobalConfig.ForceUpdateParameter(returnObject.newplan, _prversion.id, parameterService);
            return returnObject;

        }

        [Route("TrackingGet/{user_id:guid}")]
        [HttpGet]
        public bool TrackingGet(Guid user_id)
        {
            UserProfile user = userProfileService.GetByUserId(user_id);
            //List<PersonaPlan> personaPlan = personaPlanService.GetByGuid(user_id);
            PersonaPlan personaPlan = personaPlanService.GetCurrentPlanByUserId(user_id);
            ProductVersion _prversion = _productVersionService.GetByUserId(user_id.ToString());
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            String version = BTO.Models.Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(user_id.ToString()));
            if (client != null && client.user_id.Equals(user_id))
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.LOAD_SESSION;
                PersonalPlanModel md = PersonalPlanModel.Copy(personaPlan);

                string data = "";
                if (version == "3" || version == "4")
                {
                    List<Persona> list = personaService.GetByUserId(user_id).ToList();
                    LoadSessionModel model = new LoadSessionModel();
                    //UserProfile userProfile = userProfileService.GetByUserId(user_id);
                    if (user != null)
                    {
                        UserProfileModel userProfileModel = UserProfileModel.GetFromUserProfile(user);
                        model.UserProfile = userProfileModel;
                    }
                    model.PersonalPlanModel = md;
                    model.ListPersona = list;
                    data = BTO.Models.Ultils.ToXML(model);
                }
                else
                {
                    data = BTO.Models.Ultils.ToXML(md);
                }

                userSessionService.AddUserSession(client.id, action, data);
            }

            GlobalConfig.ForceUpdateParameter(personaPlan, _prversion.id, parameterService);
            //GlobalConfig.ForceUpdateParameter(returnObject.newplan, _prversion.id, parameterService);
            return true;
        }

        private void initChildIndependent(PersonaPlan plan, UserProfile user, Dictionary<string, object> parameter)
        {
            List<UserProfileDependent> listChild = user.dependent.Where(item => item.relationship == null).ToList();

            
            


            if (listChild.Count > 0)
            {

                Dictionary<string, int?> childNameDict = new Dictionary<string, int?>();
                foreach (var child in listChild) {
                    if (child.full_name == null)
                    {
                        if (childNameDict.ContainsKey(""))
                        {
                            childNameDict[""]++;
                        }
                        else
                        {
                            childNameDict.Add("", 1);
                        }
                    }
                    else
                    {
                        if (childNameDict.ContainsKey(child.full_name))
                        {
                            childNameDict[child.full_name]++;
                        }
                        else
                        {
                            childNameDict.Add(child.full_name, 1);
                        }
                    }
                }
                for (var i = 0; i < listChild.Count; i++) {
                    string full_name = listChild[i].full_name;
                    if (listChild[i].full_name == null)
                    {
                        if (childNameDict[""] == 1)
                        {
                            listChild[i].full_name = "child";
                        }
                        else {
                            int findCount = 0;
                            for (var j = 0; j < listChild.Count; j++)
                            {
                                if (listChild[j].full_name == null) {
                                    findCount++;
                                    listChild[j].full_name = "child " + findCount.ToString();
                                }
                            }
                        }
                    }
                    else {
                        if (childNameDict.ContainsKey(full_name) && childNameDict[listChild[i].full_name] > 1)
                        {
                            int findCount = 0;
                            for (var j = 0; j < listChild.Count; j++)
                            {
                                if (full_name == null && listChild[j].full_name == null)
                                {
                                    findCount++;
                                    listChild[j].full_name = "child " + findCount.ToString();
                                }
                                else if (full_name != null && full_name == listChild[j].full_name)
                                {
                                    findCount++;
                                    listChild[j].full_name = "child " + findCount.ToString();
                                }
                            }
                        }
                    }
                }


                int count = 1;
                foreach (var child in listChild)
                {
                    if (count <= 4 && Convert.ToInt32(parameter["_c_ind_child_" + count]) >= child.age)
                    {
                        LifeEvent childIndependent = new LifeEvent();
                        DreamType type = dreamTypeService.GetById(5);
                        childIndependent.persona_plan_id = plan.id;
                        childIndependent.dream_type = type;
                        childIndependent.existant = false;
                        childIndependent.name = child.full_name == null ? "child" : child.full_name;
                        childIndependent.name += " independent";
                        childIndependent.dependent_reference = "child_" + child.id.ToString();
                        
                        int start_age = plan.start_age == null ? Convert.ToInt32(parameter["_c_age_main"]) : Convert.ToInt32(plan.start_age);
                        int starting_age = start_age + Convert.ToInt32(parameter["_c_ind_child_" + count]) - child.age;

                        childIndependent.starting_age = starting_age;
                        //double yearly_cost_reduction = this.costReductionOfChild(1, user, parameter);
                        //childIndependent.yearly_cost_reduction = (decimal) yearly_cost_reduction * 12;
                        childIndependent.yearly_cost_reduction = 0;
                        plan.lifeEvent.Add(childIndependent);
                    }
                    count++;
                }
            }
        }

        private double costReductionOfChild(int childIndex,UserProfile userProfile, Dictionary<string, object> parameter) {
            double totalExpenseOfChild = 0;
            //double recuringExpense = 0;            
            ProductVersion _prversion = _productVersionService.GetByUserId(userProfile.user_login_id.ToString());
            var defaultExpenses = GlobalConfig.GetDefaultExpense(_prversion.id);
            foreach (Models.Expense expense in defaultExpenses) {
                totalExpenseOfChild += this.calculateCostOfChild(expense, childIndex);
            }
            return totalExpenseOfChild / 0.012;
        }

        private double calculateCostOfChild(Expense expense, int childIndex)
        {
            double result = 0;
            if (expense.name.IndexOf("_child_" + childIndex.ToString()) >= 0 && (expense.children == null || expense.children.Count == 0)) {
                result = (double)expense.default_value;
            }
            if (expense.children != null && expense.children.Count > 0)
            {
                foreach (Expense childExpense in expense.children)
                {
                    result += calculateCostOfChild(childExpense, childIndex) ;
                }
            }
            
            return result;
        }

        [Route("calculate")]
        [HttpPost]
        // GET api/<controller>
        public PersonaPlan calculate(PersonaPlan user)
        { 
            return user;
        }

        [Route("adddream")]
        [HttpPost]
        // GET api/<controller>
        public object addDream(Dream dream)
        {
            List<FunctionAccessModel> listpermission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            bool permision = BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.ADD_DREAM);
            if (permision == false)
                return -1;

            if (!String.IsNullOrEmpty(dream.photoContent))
            {
                string subPath = "DreamImages";
                string root = HttpContext.Current.Server.MapPath("~/");

                try
                {
                    if (!System.IO.Directory.Exists(root + subPath))
                    {
                        System.IO.Directory.CreateDirectory(root + subPath);
                    }
                    Guid id = Guid.NewGuid();
                    var myString = dream.photoContent.Split(new char[] { ',' });
                    byte[] bytes = Convert.FromBase64String(myString[1]);
                    using (System.IO.MemoryStream ms = new System.IO.MemoryStream(bytes))
                    {
                        System.Drawing.Image image = System.Drawing.Image.FromStream(ms);
                        String path = root + subPath + "/" + id.ToString() + ".jpg";
                        image.Save(path);
                        dream.photo_path = "/" + subPath + "/" + id.ToString() + ".jpg";
                        dream.photoContent = null;
                    }

                }
                catch (Exception e)
                {

                }
            }

            PersonaPlan plan = personaPlanService.GetById(dream.persona_plan_id);
            DreamType type = dreamTypeService.GetById(dream.dream_type_id);
            dream.persona_plan = plan;
            dream.dream_type = type;
            plan.dreams.Add(dream);
            personaPlanService.Create(plan);
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.ADD_DREAM;
                DreamModel md = DreamModel.Copy(dream);
                string data = BTO.Models.Ultils.ToXML(md);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return (object)dream;
        }

        [Route("addLifeEvent")]
        [HttpPost]
        // GET api/<controller>
        public object addLifeEvent(LifeEvent lifeEvents)
        {
            List<FunctionAccessModel> listpermission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            bool permision = BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.ADD_LIFE_EVENT);
            if (permision == false)
                return -1;
            if (!String.IsNullOrEmpty(lifeEvents.photoContent))
            {
                string subPath = "DreamImages";
                string root = HttpContext.Current.Server.MapPath("~/");

                try
                {
                    if (!System.IO.Directory.Exists(root + subPath))
                    {
                        System.IO.Directory.CreateDirectory(root + subPath);
                    }
                    Guid id = Guid.NewGuid();
                    var myString = lifeEvents.photoContent.Split(new char[] { ',' });
                    byte[] bytes = Convert.FromBase64String(myString[1]);
                    using (System.IO.MemoryStream ms = new System.IO.MemoryStream(bytes))
                    {
                        System.Drawing.Image image = System.Drawing.Image.FromStream(ms);
                        String path = root + subPath + "/" + id.ToString() + ".jpg";
                        image.Save(path);
                        lifeEvents.photo_path = "/" + subPath + "/" + id.ToString() + ".jpg";
                        lifeEvents.photoContent = null;
                    }

                }
                catch (Exception e)
                {

                }
            }
            PersonaPlan plan = personaPlanService.GetById(lifeEvents.persona_plan_id);
            DreamType type = dreamTypeService.GetById(lifeEvents.dream_type_id);
            lifeEvents.persona_plan = plan;
            lifeEvents.dream_type = type;
            plan.lifeEvent.Add(lifeEvents);
            personaPlanService.Create(plan);
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.ADD_LIFEEVENT;
                LifeEventModel md = LifeEventModel.Copy(lifeEvents);
                string data = BTO.Models.Ultils.ToXML(md);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return (object)lifeEvents;
        }

        [Route("deleteDream")]
        [HttpPost]
        // GET api/<controller>
        public object deleteDream(object id)
        {
            List<FunctionAccessModel> listpermission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            bool permision = BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.REMOVE_DREAM);
            if (permision == false)
                return -1;

            int dream_id = Convert.ToInt32(id);
            Dream dr = dreamService.GetById(dream_id);
            if (dr != null)
            {
                dr.persona_plan = null;
                dr.dream_type = null;
                dreamService.Delete(dr);
                ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
                if (client != null)
                {
                    BTO.Common.WebAction.Action action = Common.WebAction.Action.REMOVE_DREAM;
                    DreamModel md = DreamModel.Copy(dr);
                    string data = BTO.Models.Ultils.ToXML(md);
                    userSessionService.AddUserSession(client.id, action, data);
                }
            }
            return (object)id;
        }
        [Route("deleteLifeEvent")]
        [HttpPost]
        // GET api/<controller>
        public object deleteLifeEvent(object id)
        {
            List<FunctionAccessModel> listpermission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            bool permision = BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.REMOVE_LIFE_EVENT);
            if (permision == false)
                return -1;

            int lifeEvent_id = Convert.ToInt32(id);
            LifeEvent dr = lifeEventService.GetById(lifeEvent_id);
            if (dr != null)
            {
                dr.persona_plan = null;
                dr.dream_type = null;
                lifeEventService.Delete(dr);
                ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
                if (client != null)
                {
                    BTO.Common.WebAction.Action action = Common.WebAction.Action.REMOVE_LIFEEVENT;
                    LifeEventModel md = LifeEventModel.Copy(dr);
                    string data = BTO.Models.Ultils.ToXML(md);
                    userSessionService.AddUserSession(client.id, action, data);
                }
            }
            return (object)id;
        }
        public object Post(PersonaPlan source)
        {
            if (source.id > 0)
            {
                PersonaPlan target = personaPlanService.GetById(source.id);
                ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
                TrackObjectChange trackingchange = null;
                UserSession session = new UserSession();
                session.client_profile_id = client.id;
                session.time_create = DateTime.Now;
                BTO.Common.WebAction.Action action;
                if (client != null)
                {
                    string version = BTO.Models.Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(User.Identity.GetUserId()));
                    trackingchange = personaPlanService.TrackingChange(source, target, client.id,version);
                    if (trackingchange != null)
                    {
                        List<FunctionAccessModel> listpermission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
                        if ((trackingchange.type.IndexOf("EDIT_DREAM") > -1 || trackingchange.type.IndexOf("MOVE_DREAM_PURCHAGE") > -1) && BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.EDIT_DREAM))
                        {                           
                            personaPlanService.UpdatePersonaPlan(source, target);
                            Enum.TryParse<BTO.Common.WebAction.Action>(trackingchange.type, out action);
                            session.action_name = trackingchange.type;
                            session.action_description = BTO.Common.Utils.getActionDescription(action);
                            session.data = BTO.Common.Utils.ToXML(trackingchange);
                            userSessionService.AddUserSession(session);
                            return target;
                        }
                        if ((trackingchange.type.IndexOf("MOVE_LIFEEVENT_PURCHAGE") > -1 || trackingchange.type.IndexOf("EDIT_LIFEEVENT") > -1) && BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.EDIT_LIFE_EVENT))
                        {                            
                            personaPlanService.UpdatePersonaPlan(source, target);
                            Enum.TryParse<BTO.Common.WebAction.Action>(trackingchange.type, out action);
                            session.action_name = trackingchange.type;
                            session.action_description = BTO.Common.Utils.getActionDescription(action);
                            session.data = BTO.Common.Utils.ToXML(trackingchange);
                            userSessionService.AddUserSession(session);
                            return target;
                        }
                        string field = "CHANGE_" + trackingchange.listchange[0].fieldname.ToUpper(); ;
                        FunctionPermission permission;
                        bool isHasPermission = false;
                        switch (field)
                        {
                            case "CHANGE_SOCIAL_SECURITY_AGE":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_RETIREMENT_AGE", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                            case "CHANGE_EXPENSE_TODAY":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_INCOME_TODAY", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                            case "CHANGE_NUMBER_TRIALS":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_NUMBER_OF_TRIALS", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                            case "CHANGE_MC_TOP_VALUE":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_TOP_VALUE", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                            case "CHANGE_MC_BOTTOM_VALUE":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_BOTTOM_VALUE", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                            case "CHANGE_CURRENCY_CODE":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_CURRENCY", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                            case "CHANGE_VOLATILITY":
                            case "CHANGE_RISK_RETURN":
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_VOLATILITY_SIMPLE", true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                if (!isHasPermission)
                                {
                                    permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), "CHANGE_VOLATILITY_EXPERT", true);
                                    isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                }
                                break;
                            case "CHANGE_RETIREMENT_LIFESTYLE":
                                isHasPermission = true;
                                break;
                            default:
                                permission = (FunctionPermission)Enum.Parse(typeof(FunctionPermission), field, true);
                                isHasPermission = BTO.Common.Utils.CheckPermissionOnAction(listpermission, permission);
                                break;
                        }
                        if (isHasPermission)
                        {
                            UserProfile userProfile = userProfileService.GetByUserId(source.user_id);
                            if (userProfile != null && userProfile.isChangedStartAge != null && userProfile.isChangedStartAge)
                            {
                                source.start_age = userProfile.age;
                            }
                            personaPlanService.UpdatePersonaPlan(source, target);
                            Enum.TryParse<BTO.Common.WebAction.Action>(field, out action);
                            session.action_name = field;
                            session.action_description = BTO.Common.Utils.getActionDescription(action);
                            session.data = BTO.Common.Utils.ToXML(trackingchange.listchange);
                            userSessionService.AddUserSession(session);
                            return null;
                        }
                    }
                }
            }
           
            return null;
        }
        [Route("resetplan")]
        [HttpPost]
        public object ResetPlan(object obj)
        {
            List<FunctionAccessModel> listpermission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            bool permision = false;
            if (listpermission != null && listpermission.Count > 0)
            {
                permision = BTO.Common.Utils.CheckPermissionOnAction(listpermission, FunctionPermission.RESET_PLAN);
            }

            if (permision == false)
                return null;
            
            var json = JObject.Parse(obj.ToString());
            string user_id = (string)json["user_id"];
            int status = (int)json["status"];
            UserProfile user = userProfileService.GetByUserId(Guid.Parse(user_id));
            PersonaPlan personaPlan = personaPlanService.ResetPlan(user_id, status);

            if (json.Property("retirement_age") != null && json.Property("social_security_age") != null)
            {
                int retirement_age = (int)json["retirement_age"];
                int social_security_age = (int)json["social_security_age"];
                personaPlan.retirement_age = retirement_age;
                personaPlan.social_security_age = social_security_age;
            }
            personaPlan.retirement_lifestyle = -1;
            personaPlanService.Update(personaPlan);


            //--------------
            //----------------------
            ProductVersion _prversion = _productVersionService.GetByUserId(user_id.ToString());
            Dictionary<string, object> parameter = GlobalConfig.GetParameter(_prversion.id, parameterService);
            List<Parameter> parameters = parameterService.GetParametersForUser(user_id.ToString());
            PersonaPlan current = personaPlan;
            int _c_dwelling_type = Convert.ToInt32(parameter["_c_dwelling_type"]);
            int _c_age_main = Convert.ToInt32(parameter["_c_age_main"]);
            Dream defaultDream = new Dream();
            defaultDream.residential_type = _c_dwelling_type;
            defaultDream.dream_type_id = 1;
            defaultDream.persona_plan_id = current.id;
            defaultDream.name = "Residence purchase 1";
            Parameter total_cost_parameter = parameters.Where(x => x.name == "dream.residence_purchase.total_cost").SingleOrDefault();
            if (total_cost_parameter != null)
                defaultDream.total_cost = Decimal.Parse(total_cost_parameter.default_value);
            else
                defaultDream.total_cost = 0;

            defaultDream.purchase_age = user.age;
            defaultDream.payment_duration = Math.Min(60 - _c_age_main, 25);
            defaultDream.down_payment = defaultDream.total_cost * (defaultDream.payment_duration / 25);
            Parameter mortage_interest_rate = parameters.Where(x => x.name == "dream.residence_purchase.mortage_interest_rate").SingleOrDefault();
            if (mortage_interest_rate != null)
            {
                defaultDream.mortage_interest_rate = Decimal.Parse(mortage_interest_rate.default_value);
            }
            defaultDream.rental_net_income = 0;
            defaultDream.yearly_expenses = 0;

            defaultDream.transaction_cost = 0;
            defaultDream.existant = true;
            defaultDream.is_rent = false;
            defaultDream.is_living = false;
            defaultDream.is_absolute_dream_down_payment = true;
            DreamType type = dreamTypeService.GetById(defaultDream.dream_type_id);

            defaultDream.dream_type = type;
            Parameter property_type_parameter = parameters.Where(x => x.name == "dream.residence_purchase.property_type").SingleOrDefault();
            if (property_type_parameter != null)
            {
                List<ListItem> items = listItemService.GetByParameterId(property_type_parameter.id).ToList();
                ListItem item = items.Where(x => x.value == _c_dwelling_type.ToString()).SingleOrDefault();
                if (item != null)
                    defaultDream.name = item.name;
            }
            personaPlan.dreams.Add(defaultDream);

            personaPlan.start_age = user.age;
            this.initChildIndependent(personaPlan, user, parameter);

            personaPlanService.Update(personaPlan);
            //-----------------


            var returnObject = new { plan = personaPlan };
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.RESET_PLAN_BUTTON;
                PersonalPlanModel md = PersonalPlanModel.Copy(personaPlan);

                String version = BTO.Models.Ultils.GetUiVersion(_organizationUnitUserService.GetUiVersionByUserId(user_id.ToString()));
                string data = "";
                if (version == "3" || version == "4")
                {
                    List<Persona> list = personaService.GetByUserId(Guid.Parse(user_id)).ToList();
                    LoadSessionModel model = new LoadSessionModel();
                    model.PersonalPlanModel = md;
                    model.ListPersona = list;
                    data = BTO.Models.Ultils.ToXML(model);
                }
                else
                {
                    data = BTO.Models.Ultils.ToXML(md);
                }
                userSessionService.AddUserSession(client.id, action, data);
            }
            return returnObject;
        }
        [Route("changeToCurrentPlan")]
        [HttpPost]
        public object changeToCurrentPlan(PersonaPlan personaPlan)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.CURRENT_SCENARIO_BUTTON;
                PersonalPlanModel md = PersonalPlanModel.Copy(personaPlan);

                string data = BTO.Models.Ultils.ToXML(md);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return "OK";
        }
        [Route("changeToNewPlan")]
        [HttpPost]
        public object changeToNewPlan(PersonaPlan personaPlan)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.NEW_SCENARIO_BUTTON;
                PersonalPlanModel md = PersonalPlanModel.Copy(personaPlan);

                string data = BTO.Models.Ultils.ToXML(md);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return "OK";
        }
        [Route("GetScenario/{user_id:guid}")]
        // GET api/<controller>
        public List<Scenario> GetScenario(Guid user_id)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
                return null;
            List<Scenario> list = personaPlanService.GetListScenario(user_id);
            BTO.Common.WebAction.Action action = Common.WebAction.Action.MANAGE_SCENARIO;

            string data = BTO.Models.Ultils.ToXML(ScenarioXml.ListFromModel(list));
            userSessionService.AddUserSession(client.id, action, data);
            return list;
        }

        [Route("UpdateScenario")]
        [HttpPost]
        // GET api/<controller>
        public BaseResponse<List<Scenario>> UpdateScenario(Scenario scenario)
        {
            var result = new BaseResponse<List<Scenario>>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.RENAME_SCENARIO.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Don't have permission on rename scenario!";
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

            int id = scenario.id;
            PersonaPlan persona = personaPlanService.GetById(id);
            if (persona != null)
            {
                persona.status = scenario.status;
                persona.name = scenario.name;
                personaPlanService.Create(persona);
            }
            BTO.Common.WebAction.Action action = Common.WebAction.Action.RENAME_SCENARIO;

            string data = BTO.Models.Ultils.ToXML(ScenarioXml.FromModel(scenario));
            userSessionService.AddUserSession(client.id, action, data);

            result.results = personaPlanService.GetListScenario(scenario.user_id);
            result.success = true;
            result.errcode = "";

            return result;
        }
        [Route("UpdateStatusScenario")]
        [HttpPost]
        // GET api/<controller>
        public BaseResponse<object> UpdateStatusScenario(Scenario scenario)
        {
            var result = new BaseResponse<object>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            string namePermission = "";
            if (scenario.status == Model.Common.ScenarioType.Current)
                namePermission = FunctionPermission.MAKE_CURRENT_SCENARIO.ToString();
            else
                namePermission = FunctionPermission.MAKE_NEW_SCENARIO.ToString();
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == namePermission && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Don't have permission on rename scenario!";
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

            int id = scenario.id;
            List<PersonaPlan> personas = personaPlanService.GetByGuid(scenario.user_id);
            PersonaPlan current = personas.Where(x => x.id == id).FirstOrDefault();
            PersonaPlan relate = personas.Where(y => y.status == scenario.status).FirstOrDefault();
            if (current != null)
            {
                if (current.status == null || current.status != scenario.status)
                {
                    relate.status = current.status;
                    personaPlanService.Create(relate);
                    current.status = scenario.status;
                    personaPlanService.Create(current);
                }
            }
            //List<PersonaPlan> personaPlan = personaPlanService.GetByGuid(scenario.user_id);
            var returnObject = new
            {
                currentplan = personas.Where(t => t.status == Model.Common.ScenarioType.Current).FirstOrDefault(),
                newplan = personas.Where(t => t.status == Model.Common.ScenarioType.New).FirstOrDefault(),
                listScenario = personaPlanService.MigrateFromPersonaPlan(personas).OrderBy(x => x.status == null).ThenBy(t => t.status).ThenByDescending(y => y.time_create)
            };
            BTO.Common.WebAction.Action action;
            if (scenario.status == Model.Common.ScenarioType.Current)
                action = Common.WebAction.Action.MAKE_CURRENT_SCENARIO;
            else
                action = Common.WebAction.Action.MAKE_NEW_SCENARIO;

            string data = BTO.Models.Ultils.ToXML(ScenarioXml.FromModel(scenario));
            userSessionService.AddUserSession(client.id, action, data);

            result.results = returnObject;
            result.success = true;
            result.errcode = "";

            return result;

        }
        [Route("CreateNewScenario")]
        [HttpPost]
        // GET api/<controller>
        public BaseResponse<List<Scenario>> CreateNewScenario(object obj)
        {
            var result = new BaseResponse<List<Scenario>>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.MAKE_NEW_SCENARIO.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Don't have permission on create new scenario!";
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

            JObject jObject = JObject.Parse(obj.ToString());
            int id = (int)jObject["id"];
            string name = (string)jObject["name"];
            Guid user_id = (Guid)jObject["user_id"];
            PersonaPlan plan = personaPlanService.CreatePersonaPlanFromAnother(id, name);
            Scenario scenario = new Scenario()
            {
                id = plan.id,
                name = name,
                user_id = user_id,
                status = plan.status,
                time_create = plan.time_create
            };
            BTO.Common.WebAction.Action action = Common.WebAction.Action.NEW_SCENARIO;

            string data = BTO.Models.Ultils.ToXML(ScenarioXml.FromModel(scenario));
            userSessionService.AddUserSession(client.id, action, data);

            result.results = personaPlanService.GetListScenario(scenario.user_id);
            result.success = true;
            result.errcode = "";

            return result;
        }
        [Route("DuplicateScenarios")]
        [HttpPost]
        // GET api/<controller>
        public BaseResponse<List<Scenario>> DuplicateScenarios(object obj)
        {
            var result = new BaseResponse<List<Scenario>>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.DUPLICATE_SCENARIO.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Don't have permission on duplicate scenario!";
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

            JavaScriptSerializer js = new JavaScriptSerializer();
            List<Scenario> scenarios = js.Deserialize<List<Scenario>>(obj.ToString());
            if (scenarios != null && scenarios.Count > 0)
            {
                //personaPlanService.CreatePersonaPlanFromAnother(id, name);
                List<PersonaPlan> listPlan = personaPlanService.DuplicateScenarios(scenarios);
                List<Scenario> listScenarios = personaPlanService.MigrateFromPersonaPlan(listPlan);
                BTO.Common.WebAction.Action action = Common.WebAction.Action.DUPLICATE_SCENARIO;

                string data = BTO.Models.Ultils.ToXML(ScenarioXml.ListFromModel(listScenarios));
                userSessionService.AddUserSession(client.id, action, data);

                result.results = personaPlanService.GetListScenario(scenarios[0].user_id);
                result.success = true;
                result.errcode = "";

                return result;
            }

            return null;
        }
        [Route("DeleteScenarios")]
        [HttpPost]
        // GET api/<controller>
        public BaseResponse<List<Scenario>> DeleteScenarios(object obj)
        {
            var result = new BaseResponse<List<Scenario>>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.DELETE_SCENARIO.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Don't have permission on duplicate scenario!";
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

            JavaScriptSerializer js = new JavaScriptSerializer();
            List<Scenario> scenarios = js.Deserialize<List<Scenario>>(obj.ToString());
            if (scenarios != null && scenarios.Count > 0)
            {
                personaPlanService.DeleteScenarios(scenarios);
                BTO.Common.WebAction.Action action = Common.WebAction.Action.DELETE_SCENARIO;

                string data = BTO.Models.Ultils.ToXML(ScenarioXml.ListFromModel(scenarios));
                userSessionService.AddUserSession(client.id, action, data);

                result.results = personaPlanService.GetListScenario(scenarios[0].user_id);
                result.success = true;
                result.errcode = "";

                return result;
            }

            return null;
        }
        [Route("CloseScenario")]
        [HttpPost]
        // GET api/<controller>
        public object CloseScenario(PersonaPlan plan)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client == null)
                return null;
            BTO.Common.WebAction.Action action = Common.WebAction.Action.CLOSE_SCENARIOS;

            string data = BTO.Models.Ultils.ToXML(PersonalPlanModel.Copy(plan));
            userSessionService.AddUserSession(client.id, action, data);
            return true;
        }
        [Route("ChangeTab/{tabName}")]
        [HttpGet]
        // GET api/<controller>
        public object ChangeTab(string tabName)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];

            if (client != null && HttpContext.Current.Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;


                BTO.Common.Tab tab = new Common.Tab { Name = tabName };
                string data = BTO.Models.Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return null;
        }

        [Route("ChangeSession/{sessionName}")]
        [HttpGet]
        // GET api/<controller>
        public object ChangeSession(string sessionName)
        {
            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];

            if (client != null && HttpContext.Current.Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.CHANGE_SESSION;


                BTO.Common.Session tab = new Common.Session { Name = sessionName };
                string data = BTO.Models.Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return null;
        }
    }
}