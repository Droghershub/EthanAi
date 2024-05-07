using BTO.Model;
using BTO.Modules;
using BTO.Service;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Transactions;
using BTO.Model.Common;
using BTO.Model.UserManagement;
using System.Web;
using BTO.Model.Tracking;
using BTO.Models;
namespace BTO.API
{
    [RoutePrefix("api/user_profile")]
    public class UserProfileController : BTOAPIController
    {
        public IParameterService parameterService { get; set; }
        public IUserProfileService userProfileService { get; set; }
        public IAspNetUserService apNetUserService { get; set; }
        public IPersonaPlanService personaPlanService { get; set; }
        public ILifeEventService lifeEventService { get; set; }
        public IDreamTypeService dreamTypeService { get; set; }
        public IDreamService dreamService { get; set; }
        public IProductVersionService _productVersionService { get; set; }
        public Service.Tracking.IUserSessionService userSessionService { get; set; }

        [Route("update_profile")]
        [HttpPost]
        // POST api/<controller>
        public BaseResponse<UserProfile> UpdateProfile(UserProfile userProfile)
        {
            var result = new BaseResponse<UserProfile>();
            List<FunctionAccessModel> permission = (List<FunctionAccessModel>)HttpContext.Current.Session["UserPermission"];
            List<FunctionAccessModel> permissionself = permission.Where(x => x.name == FunctionPermission.MANAGE_PROFILE.ToString() && x.action == FunctionAction.READ_WRITE).ToList();
            if (permissionself.Count() == 0)
            {
                result.results = null;
                result.success = false;
                result.errcode = "Updating of profile is not permitted";
                return result;
            }
            ProductVersion _prversion = _productVersionService.GetByUserId(userProfile.user_login_id.ToString());
            Dictionary<string, object> parameter = GlobalConfig.GetParameter(_prversion.id, parameterService);
            int[] _c_ind_child_ = new int[] { Convert.ToInt32(parameter["_c_ind_child_1"]), Convert.ToInt32(parameter["_c_ind_child_2"]), Convert.ToInt32(parameter["_c_ind_child_3"]), Convert.ToInt32(parameter["_c_ind_child_4"]) };        

            ClientProfile client = (ClientProfile)HttpContext.Current.Session["ProfileSession"];
            if (client != null)
            {
                try
                {
                    using (TransactionScope scope = new TransactionScope())
                    {

                        UserProfile userProfileOrigin = userProfileService.GetByUserId(userProfile.user_login_id);
                        if (userProfileOrigin != null)
                        {
                            List<UserProfileDependent> needDelete = new List<UserProfileDependent>();
                            if (userProfileOrigin.married_status == 1 && (userProfile.married_status == null || userProfile.married_status == 0))
                            {
                                dreamService.UpdateDependentReferenceOfDream(userProfile.persona_plan_id, "spouse", "client");
                            }

                            foreach (UserProfileDependent dependentOrigin in userProfileOrigin.dependent)
                            {
                                if (userProfile.dependent.Where(x => x.id == dependentOrigin.id).Count() <= 0)
                                {
                                    if (dependentOrigin.relationship == null)     {
                                        dreamService.UpdateDependentReferenceOfDream(userProfile.persona_plan_id, "child_" + dependentOrigin.id, "client");
                                    }                                        
                                    else if (dependentOrigin.relationship == 1)
                                        dreamService.UpdateDependentReferenceOfDream(userProfile.persona_plan_id, "dependent_" + dependentOrigin.id, "client");
                                    needDelete.Add(dependentOrigin);                                    
                                    
                                }
                                
                            }
                            if (userProfileOrigin.isChanged && !WebConfigBySingleton.Instance.isCanEditProfile)
                            {
                                foreach (UserProfileDependent dependentOrigin in userProfileOrigin.dependent)
                                {
                                    if (userProfile.dependent.Where(x => x.id == dependentOrigin.id).Count() <= 0)
                                    {
                                        if (dependentOrigin.relationship == null)
                                            lifeEventService.UpdateDependentReferenceOfLifeEvent(userProfile.persona_plan_id, "child_" + dependentOrigin.id, "other");
                                    }
                                }
                            }
                            else
                            {
                                lifeEventService.DeleteAllByUserId(userProfile.persona_plan_id);
                            }
                            if (userProfileOrigin.isChangedStartAge)
                            {
                                if (!WebConfigBySingleton.Instance.isCanEditProfile)
                                    userProfile.age = userProfileOrigin.age;
                                userProfile.isChangedStartAge = true; 
                            }
                            if(needDelete.Count > 0)
                            {
                                userProfileService.DeleteListDependent(needDelete);
                                foreach (UserProfileDependent df in needDelete)
                                {
                                    userProfileOrigin.dependent.Remove(df);
                                }
                            }                                           
                            userProfileService.UpdateProfile(userProfile, userProfileOrigin);
                            userProfileService.UpdateStartAge(userProfile, userProfile.age); 
                        }
                        else
                        {
                            userProfileService.Create(userProfile);
                        }
                        apNetUserService.UpdateEmail(userProfile.user_login_id.ToString(), userProfile.email);


                        PersonaPlan current = personaPlanService.GetByGuid(userProfile.user_login_id).Where(x => x.status == (userProfile.typeplan == "current" ? ScenarioType.Current : ScenarioType.New)).FirstOrDefault();

                        IEnumerable<LifeEvent> lifeEvents = current.lifeEvent.Where(x => x.dream_type_id == 5);                        

                        if (lifeEvents == null || lifeEvents.Count() == 0)
                        {
                            int i = 1;
                            List<LifeEvent> listLifeEvent = new List<LifeEvent>();
                            foreach (var dependent in userProfile.dependent)
                            {
                                if (dependent.relationship == null && dependent.handicapped == false && dependent.independent == false && _c_ind_child_[i - 1] >= dependent.age)
                                {
                                    LifeEvent lifeEvent = new LifeEvent();
                                    lifeEvent.dream_type_id = 5;
                                    lifeEvent.persona_plan_id = current.id;
                                    lifeEvent.dream_id = null;

                                    lifeEvent.name = (string.IsNullOrEmpty(dependent.full_name) ? "Children" : dependent.full_name);
                                    lifeEvent.dependent_reference = "child_" + dependent.id;
                                    lifeEvent.value = 0;
                                        
                                    lifeEvent.starting_age = userProfile.age + _c_ind_child_[i-1] - dependent.age;
                                    lifeEvent.yearly_cost_reduction = 0;
                                    lifeEvent.transaction_cost = 0;
                                    lifeEvent.transaction_tax = 0;                                    
                                    listLifeEvent.Add(lifeEvent);
                                    i++;
                                }
                            }
                            if (listLifeEvent.Count > 0) {
                                
                                foreach (var lifeEvent in listLifeEvent)
                                {
                                    List<LifeEvent> listItemLifeEvent = listLifeEvent.FindAll(item => item.name == lifeEvent.name);
                                    if (listItemLifeEvent != null && listItemLifeEvent.Count >= 2)
                                    {
                                        int countDuplicate = 0;
                                        foreach (var itemLifeEvent in listItemLifeEvent)
                                        {
                                            countDuplicate++;
                                            itemLifeEvent.name += ' ' + countDuplicate.ToString();
                                        };
                                        
                                    }
                                    lifeEvent.name += " Independent";
                                    lifeEventService.Create(lifeEvent);
                                }
                            }
                        }
                        scope.Complete();

                    }
                }
                catch (Exception ex)
                {
                    if (ex.InnerException.InnerException.Message.Contains("Cannot insert duplicate key row"))
                    {
                        result.results = null;
                        result.success = false;
                        result.errcode = "Email is already existing. Failed to update profile";
                    }
                    result.results = null;
                    result.success = false;
                    result.errcode = "Failed to update profile";
                }
                UserProfile user = userProfileService.GetByUserId(userProfile.user_login_id);
                BTO.Common.WebAction.Action action = Common.WebAction.Action.UPDATE_PROFILE;
                UserProfileModel userProfileModel = UserProfileModel.GetFromUserProfile(user);
                string data = BTO.Models.Ultils.ToXML(userProfileModel);
                userSessionService.AddUserSession(client.id, action, data);
                result.results = user;
                result.success = true;
            }
            else
            {
                result.results = null;
                result.success = false;
                result.errcode = "Session timeout!";
            }
            return result;
        }

        [Route("check_email_existing")]
        [HttpPost]
        // POST api/<controller>
        public bool CheckEmailExisting(JObject data)
        {
            dynamic json = data;
            string user_id = json.user_id;
            string email = json.email;
            try
            {
                return apNetUserService.CheckEmailExisting(user_id, email);
            }
            catch (Exception)
            {
                return false;
            }

        }

        [Route("update_tutorial_profile")]
        [HttpPost]
        public bool UpdateTutorialProfile(JObject data)
        {
            dynamic json = data;
            Guid user_id = Guid.Parse((string)json.user_id);
            UserProfile user = userProfileService.GetByUserId(user_id);
            user.viewed_tutorial = true;
            userProfileService.Update(user);
            return user.viewed_tutorial;
        }

        [Route("get_profile/{user_id:guid}")]
        [HttpGet]
        public UserProfile GetProfile(Guid user_id)
        {            
            UserProfile user = userProfileService.GetByUserId(user_id);
            bool isExistingBefore = true;
            if (user == null || user.married_status == -1)
            {
                ProductVersion _prversion = _productVersionService.GetByUserId(user_id.ToString());
                Dictionary<string, object> parameter = GlobalConfig.GetParameter(_prversion.id, parameterService);

                AspNetUser aspNetUser = apNetUserService.GetById(user_id);
                if (user == null)
                {
                    user = new UserProfile();
                    user.viewed_tutorial = false;
                    isExistingBefore = false;
                }
                int _c_household_size = Convert.ToInt32(parameter["_c_household_size"]);
                int _c_gender_main = Convert.ToInt32(parameter["_c_gender_main"]);
                int _c_occupation_main = Convert.ToInt32(parameter["_c_occupation_main"]);
                int _c_age_main = Convert.ToInt32(parameter["_c_age_main"]);
               
                

                int _c_age_child_1 = Convert.ToInt32(parameter["_c_age_child_1"]);
                int _c_age_child_2 = Convert.ToInt32(parameter["_c_age_child_2"]);
                int _c_age_child_3 = Convert.ToInt32(parameter["_c_age_child_3"]);
                int _c_age_child_4 = Convert.ToInt32(parameter["_c_age_child_4"]);


                int _c_gender_child_1 = Convert.ToInt32(parameter["_c_gender_child_1"]);
                int _c_gender_child_2 = Convert.ToInt32(parameter["_c_gender_child_2"]);
                int _c_gender_child_3 = Convert.ToInt32(parameter["_c_gender_child_3"]);
                int _c_gender_child_4 = Convert.ToInt32(parameter["_c_gender_child_4"]);

                int _c_age_spouse = Convert.ToInt32(parameter["_c_age_spouse"]);
                int _c_gender_spouse = Convert.ToInt32(parameter["_c_gender_spouse"]);
                int _c_occupation_spouse = Convert.ToInt32(parameter["_c_occupation_spouse"]);
                

                user.email = aspNetUser.Email;
                user.user_login_id = user_id;
                if (user.gender == null || user.gender == 0)
                    user.gender = _c_gender_main;
                user.age = _c_age_main;
                user.occupation = _c_occupation_main;
                user.nationality = "SGP";
                user.residency_status = 0;
                if (string.IsNullOrEmpty(user.first_name))
                    user.first_name = null;
                if (string.IsNullOrEmpty(user.last_name))
                    user.last_name = null;

                user.married_status = 0;
                if (_c_household_size == 4)
                {
                    user.married_status = 1;

                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_2, gender = _c_gender_child_2 });
                }
                else if (_c_household_size == 5)
                {
                    user.married_status = 1;

                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_2, gender = _c_gender_child_2 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_3, gender = _c_gender_child_3 });
                }
                else if (_c_household_size == 6)
                {
                    user.married_status = 1;

                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_2, gender = _c_gender_child_2 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_3, gender = _c_gender_child_3 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_4, gender = _c_gender_child_4 });
                }

                user.spouse_first_name = null;
                user.spouse_last_name = null;
                if (_c_household_size>=2)
                {
                    user.spouse_gender = _c_gender_spouse;
                    user.spouse_age = _c_age_spouse;
                    user.spouse_occupation = _c_occupation_spouse;
                    user.spouse_nationality = "SGP";
                    user.spouse_residency_status = 0;
                }
                if (isExistingBefore)
                    userProfileService.Update(user);
                else
                    userProfileService.Create(user);
                //
                //user = new UserProfile();
                //user.user_login_id = user_id;
                //user.email = aspNetUser.Email;
                return user;
            }
            return user;
        }
        [Route("can_change_start_age/{user_id:guid}")]
        [HttpGet]
        public bool isChangeStartAge(Guid user_id)
        {
            UserProfile user = userProfileService.GetByUserId(user_id);
            if (user != null)
            {
                if (user.isChangedStartAge)
                    return true;
            }
            return false;
        }
        [Route("update_start_age")]
        [HttpPost]
        public bool updateStartAge(JObject data)
        {
            Guid user_id = Guid.Parse(data["user_id"].ToString());
            int start_age = int.Parse(data["start_age"].ToString());
            UserProfile user = userProfileService.GetByUserId(user_id);
            if (user != null)
            {
                if (!user.isChangedStartAge || WebConfigBySingleton.Instance.isCanEditProfile)
                {
                    userProfileService.UpdateStartAge(user,start_age); 
                    return true;
                }
            }
            return false;
        } 
    }
}