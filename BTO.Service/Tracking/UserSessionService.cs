using BTO.Model.Tracking;
using BTO.Model;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Repository.Tracking;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
namespace BTO.Service.Tracking
{
    public class UserSessionService : EntityService<UserSession>, IUserSessionService
    {
        IUnitOfWork _unitOfWork;
        IUserSessionRepository _userSessionRepository;
        ICalculatorService calculateService = new CalculatorService();
        private BTO.Common.Tab currentTab;
        private bool isFirstLoad;
        private PersonaPlan currentPlan;
        private DateTime dateTime;
        public UserSessionService(IUnitOfWork unitOfWork, IUserSessionRepository userSessionRepository)
            : base(unitOfWork, userSessionRepository)
        {
            _unitOfWork = unitOfWork;
            _userSessionRepository = userSessionRepository;
            currentTab = new BTO.Common.Tab() { Name = BTO.Common.WebAction.TabName.Main.ToString() };
            isFirstLoad = true;
            dateTime = DateTime.Now;
        }
        public void AddUserSession(UserSession userSession)
        {
            
            AddSessionThread addThread = new AddSessionThread(userSession,_userSessionRepository);
            Thread thread = new Thread(new ThreadStart(addThread.DoAdd));
            thread.Start();
        }
        public void AddUserSession(int client_id, BTO.Common.WebAction.Action action, string data)
        {
            UserSession session = new UserSession();
            session.client_profile_id = client_id;
            session.action_name = Enum.GetName(action.GetType(), action);
            session.action_description = BTO.Common.Utils.getActionDescription(action);
            session.time_create = DateTime.Now;
            session.data = data;
            AddUserSession(session);            
        }
        public List<UserSessionModel> GetByClientProfile(int client_profile_id,string version)
        {
            IEnumerable<UserSession> listAction = _userSessionRepository.GetByClientProfile(client_profile_id);            
            bool isUseTab = false;
            isUseTab = version.Equals("1") || version.Equals("2");
            List<UserSessionModel> models = new List<UserSessionModel>();
            dateTime = DateTime.Now;
            BTO.Common.WebAction.Action action;
            foreach (UserSession session in listAction)
            {
             
                Enum.TryParse<BTO.Common.WebAction.Action>(session.action_name, out action);

                if ((version == "1" || version == "2") || ((version == "3" || version == "4") && action != BTO.Common.WebAction.Action.CHANGE_INCOME_TODAY && action != BTO.Common.WebAction.Action.CHANGE_EXPENSE_TODAY && action != BTO.Common.WebAction.Action.CHANGE_EXPENSE_AT_RETIREMENT))
                {
                    UserSessionModel model = GetSessionModel(session, action, isUseTab, version);
                    if (model != null)
                    {
                        if (dateTime < session.time_create)
                        {
                            model.start_time = (session.time_create - dateTime).TotalMilliseconds;
                        }
                        dateTime = session.time_create;
                        models.Add(model);
                    }
                }
                
                
                    
            }
            return models;
        }
        public UserSessionModel GetSessionModel(UserSession session, BTO.Common.WebAction.Action action, bool isUseTab, string version)
        {
            UserSessionModel md = new UserSessionModel(session);
            PersonalPlanModel personalPlanModel;
            DreamModel dreamModel;
            LifeEventModel lvModel;
            TrackObjectChange obj;
            switch (action)
            {
                case BTO.Common.WebAction.Action.LOAD_SESSION:
                    if (!isFirstLoad)
                        return null;
                    isFirstLoad = false;
                    if (version == "3" || version == "4")
                    {
                        LoadSessionModel loadmodel = BTO.Common.Utils.DeserializeFromXmlString<LoadSessionModel>(session.data);
                        currentPlan = PersonalPlanModel.ModelToPersonalPlan(loadmodel.PersonalPlanModel);
                        md.data = PersonalPlanModel.ModelToPersonalPlan(loadmodel.PersonalPlanModel); 
                        md.listPersona = loadmodel.ListPersona;
                        md.userProfile = loadmodel.UserProfile;
                    }
                    else
                    {
                        personalPlanModel = BTO.Common.Utils.DeserializeFromXmlString<PersonalPlanModel>(session.data);
                        currentPlan = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                        md.data = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                    }                    
                    break;
                case BTO.Common.WebAction.Action.RESET_PLAN_BUTTON:
                    if (version == "3" || version == "4")
                    {
                        LoadSessionModel loadmodel = BTO.Common.Utils.DeserializeFromXmlString<LoadSessionModel>(session.data);
                        currentPlan = PersonalPlanModel.ModelToPersonalPlan(loadmodel.PersonalPlanModel);
                        md.data = PersonalPlanModel.ModelToPersonalPlan(loadmodel.PersonalPlanModel); ;
                        md.listPersona = loadmodel.ListPersona;
                    }
                    else
                    {
                        personalPlanModel = BTO.Common.Utils.DeserializeFromXmlString<PersonalPlanModel>(session.data);
                        currentPlan = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                        md.data = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                    }                    
                    break;                    
                case BTO.Common.WebAction.Action.NEW_SCENARIO_BUTTON:
                case BTO.Common.WebAction.Action.CURRENT_SCENARIO_BUTTON:
                    personalPlanModel = BTO.Common.Utils.DeserializeFromXmlString<PersonalPlanModel>(session.data);
                    currentPlan = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                    md.data = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                    break;
                case BTO.Common.WebAction.Action.TAB_CLICK:
                    currentTab = BTO.Common.Utils.DeserializeFromXmlString<BTO.Common.Tab>(session.data);
                    md.data = currentTab;
                    break;
                case BTO.Common.WebAction.Action.SIMULATE_RANKING_DREAM:
                    List<BTO.Model.Tracking.RankingDreams> listRanking = BTO.Common.Utils.DeserializeFromXmlString<List<BTO.Model.Tracking.RankingDreams>>(session.data);
                    md.data = listRanking;
                    UpdateRankingIndex(currentPlan, listRanking);
                    PersonaPlan temp = new PersonaPlan(currentPlan);
                    md.dataCalculate = calculateService.CalculateRanking(temp);
                    return md;
                case BTO.Common.WebAction.Action.ADD_DREAM:
                    dreamModel = BTO.Common.Utils.DeserializeFromXmlString<DreamModel>(session.data);
                    currentPlan.dreams.Add(DreamModel.getObject(dreamModel));
                    md.data = DreamModel.getObject(dreamModel);
                    break;
                case BTO.Common.WebAction.Action.REMOVE_DREAM:
                    dreamModel = BTO.Common.Utils.DeserializeFromXmlString<DreamModel>(session.data);
                    currentPlan.dreams.Remove(currentPlan.dreams.Where(p => p.id == dreamModel.Id).FirstOrDefault());
                    md.data = DreamModel.getObject(dreamModel);
                    break;
                case BTO.Common.WebAction.Action.ADD_LIFEEVENT:
                    lvModel = BTO.Common.Utils.DeserializeFromXmlString<LifeEventModel>(session.data);
                    currentPlan.lifeEvent.Add(LifeEventModel.getObject(lvModel));
                    md.data = LifeEventModel.getObject(lvModel);
                    break;
                case BTO.Common.WebAction.Action.REMOVE_LIFEEVENT:
                    lvModel = BTO.Common.Utils.DeserializeFromXmlString<LifeEventModel>(session.data);
                    currentPlan.lifeEvent.Remove(currentPlan.lifeEvent.Where(p => p.id == lvModel.Id).FirstOrDefault());
                    md.data = LifeEventModel.getObject(lvModel);
                    break;
                case BTO.Common.WebAction.Action.EDIT_DREAM:
                case BTO.Common.WebAction.Action.MOVE_DREAM_PURCHAGE:
                    obj = BTO.Common.Utils.DeserializeFromXmlString<TrackObjectChange>(session.data);
                    md.data = obj;
                    UpdateDream(currentPlan, obj);
                    break;
                case BTO.Common.WebAction.Action.EDIT_LIFEEVENT:
                case BTO.Common.WebAction.Action.MOVE_LIFEEVENT_PURCHAGE:
                    obj = BTO.Common.Utils.DeserializeFromXmlString<TrackObjectChange>(session.data);
                    md.data = obj;
                    UpdateLifeEvent(currentPlan, obj);
                    break;
                case BTO.Common.WebAction.Action.MANAGE_SOLUTION:
                    md.data = BTO.Common.Utils.DeserializeFromXmlString<List<Solution>>(session.data);
                    return md;
                case BTO.Common.WebAction.Action.LOAD_SOLUTION:
                    SolutionModel smd = BTO.Common.Utils.DeserializeFromXmlString<SolutionModel>(session.data);
                    SolutionObject objsmd = new SolutionObject() { 
                        id = smd.id,
                        name = smd.name,
                        user_id = smd.user_id,
                        type = smd.type,
                        time_create = smd.time_create,
                        currentPlan = PersonalPlanModel.ModelToPersonalPlan(smd.currentPlan)
                    };
                    currentPlan = PersonalPlanModel.ModelToPersonalPlan( smd.currentPlan);
                    md.data = objsmd;
                    break;
                
                case BTO.Common.WebAction.Action.SAVE_SOLUTION:
                case BTO.Common.WebAction.Action.RENAME_SOLUTION:                
                case BTO.Common.WebAction.Action.DELETE_SOLUTION:
                    SolutionModel smd1 = BTO.Common.Utils.DeserializeFromXmlString<SolutionModel>(session.data);
                    smd1.currentPlan = null;
                    md.data = smd1;
                    return md;
                case BTO.Common.WebAction.Action.CLOSE_SOLUTION:
                    return md;
                case BTO.Common.WebAction.Action.MANAGE_SCENARIO:
                case BTO.Common.WebAction.Action.DELETE_SCENARIO:
                case BTO.Common.WebAction.Action.DUPLICATE_SCENARIO:
                    List<ScenarioXml> listscr = BTO.Common.Utils.DeserializeFromXmlString<List<ScenarioXml>>(session.data);                    
                    md.data = ScenarioXml.ListToModel(listscr);;
                    return md;
                case BTO.Common.WebAction.Action.NEW_SCENARIO:                
                case BTO.Common.WebAction.Action.RENAME_SCENARIO:                
                case BTO.Common.WebAction.Action.MAKE_CURRENT_SCENARIO:
                case BTO.Common.WebAction.Action.MAKE_NEW_SCENARIO:
                    ScenarioXml scr = BTO.Common.Utils.DeserializeFromXmlString<ScenarioXml>(session.data);
                    md.data = ScenarioXml.ToModel(scr);
                    return md;
                case BTO.Common.WebAction.Action.CLOSE_SCENARIOS:
                    personalPlanModel = BTO.Common.Utils.DeserializeFromXmlString<PersonalPlanModel>(session.data);
                    currentPlan = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                    md.data = PersonalPlanModel.ModelToPersonalPlan(personalPlanModel);
                    break;     
                case BTO.Common.WebAction.Action.CHANGE_CASH_FLOW:
                    Persona persona = BTO.Common.Utils.DeserializeFromXmlString<Persona>(session.data);
                    md.data = persona;
                    break;
                case BTO.Common.WebAction.Action.CHANGE_INVESTMENT_START:
                    Persona pInv = BTO.Common.Utils.DeserializeFromXmlString<Persona>(session.data);
                    md.data = pInv;
                    break;
                case BTO.Common.WebAction.Action.UPDATE_PROFILE:
                    md.data = BTO.Common.Utils.DeserializeFromXmlString<UserProfileModel>(session.data);
                    break;
                default:                    
                    List<BTO.Model.Tracking.TrackPropertyChange> listPropertyChange = BTO.Common.Utils.DeserializeFromXmlString<List<BTO.Model.Tracking.TrackPropertyChange>>(session.data);
                    md.data = listPropertyChange;
                    UpdateProperty(currentPlan, listPropertyChange);
                    break;
            }
            object dataCalculate;
            if (version == "3" || version == "4") return md;
            if (!isUseTab)
            {
                dataCalculate = calculateService.CalculateAll(currentPlan);
                md.dataCalculate = dataCalculate;
                return md;
            }
            BTO.Common.WebAction.TabName tabName;
            Enum.TryParse<BTO.Common.WebAction.TabName>(currentTab.Name, out tabName);
            switch (tabName)
            {
                case BTO.Common.WebAction.TabName.IncomeExpenses:
                    dataCalculate = calculateService.CalculateIncomeExpense(currentPlan);
                    md.dataCalculate = dataCalculate;
                    break;
                case BTO.Common.WebAction.TabName.LiquidIlliquidAsset:
                    dataCalculate = calculateService.CalculateEquityCurve(currentPlan);
                    md.dataCalculate = dataCalculate;
                    break;
                case BTO.Common.WebAction.TabName.IlliquidAsset:
                    dataCalculate = calculateService.CalculateIlliquidCurve(currentPlan);
                    md.dataCalculate = dataCalculate;
                    break;
                default:
                    dataCalculate = calculateService.CalculatorBasic(currentPlan);
                    md.dataCalculate = dataCalculate;
                    break;
            }
            return md;
        }
        public void UpdateProperty(PersonaPlan personaPlan, List<TrackPropertyChange> listChange)
        {
            foreach (TrackPropertyChange change in listChange)
            {
                Type propertyType = personaPlan.GetType().GetProperty(change.fieldname).PropertyType;
                var underlyingType = Nullable.GetUnderlyingType(propertyType);
                object value = Convert.ChangeType(change.tovalue, underlyingType ?? propertyType);
                if (change.fieldname != "saving_today")
                    personaPlan.GetType().GetProperty(change.fieldname).SetValue(personaPlan, value);
            }
        }
        public void UpdateDream(PersonaPlan personaPlan, TrackObjectChange obj)
        {
            int id = obj.id;
            Dream dr = personaPlan.dreams.Where(p => p.id == id).FirstOrDefault();
            if (dr != null)
            {
                foreach (TrackPropertyChange change in obj.listchange)
                {
                    Type propertyType = dr.GetType().GetProperty(change.fieldname).PropertyType;
                    var underlyingType = Nullable.GetUnderlyingType(propertyType);
                    object value = Convert.ChangeType(change.tovalue, underlyingType ?? propertyType);
                    dr.GetType().GetProperty(change.fieldname).SetValue(dr, value);
                }
            }
        }
        public void UpdateLifeEvent(PersonaPlan personaPlan, TrackObjectChange obj)
        {
            int id = obj.id;
            LifeEvent dr = personaPlan.lifeEvent.Where(p => p.id == id).FirstOrDefault();
            if (dr != null)
            {
                foreach (TrackPropertyChange change in obj.listchange)
                {
                    Type propertyType = dr.GetType().GetProperty(change.fieldname).PropertyType;
                    var underlyingType = Nullable.GetUnderlyingType(propertyType);
                    object value = Convert.ChangeType(change.tovalue, underlyingType ?? propertyType);
                    dr.GetType().GetProperty(change.fieldname).SetValue(dr, value);
                }
            }
        }
        public void UpdateRankingIndex(PersonaPlan personaPlan, List<BTO.Model.Tracking.RankingDreams> list)
        {
            foreach (RankingDreams rank in list)
            {
                string type = rank.type;
                if (type == "dream")
                {
                    personaPlan.dreams.Where(p => p.id == rank.id).FirstOrDefault().ranking_index = rank.index;
                }
                else if (type == "lifeevent")
                {
                    personaPlan.lifeEvent.Where(p => p.id == rank.id).FirstOrDefault().ranking_index = rank.index;
                }
            }
        }
    }
}
