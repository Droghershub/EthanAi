using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Models;
using BTO.Model.Common;
using BTO.Model.Tracking;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;
using System.Reflection;
namespace BTO.Service
{
    public class PersonaPlanService : EntityService<PersonaPlan>, IPersonaPlanService
    {
        IUnitOfWork _unitOfWork;
        IPersonaPlanRepository _userPlanRepository;
        public PersonaPlanService(IUnitOfWork unitOfWork, IPersonaPlanRepository userPlanRepository)
            : base(unitOfWork, userPlanRepository)
        {
            _unitOfWork = unitOfWork;
            _userPlanRepository = userPlanRepository;
        }


        public PersonaPlan GetById(int Id)
        {
            return _userPlanRepository.GetById(Id);
        }
        public List<PersonaPlan> GetByGuid(Guid user_id)
        {
            List<PersonaPlan> userList = _userPlanRepository.GetByGuid(user_id);            
            return userList;
        }
        public override void Create(BTO.Model.PersonaPlan entity)
        {
            _userPlanRepository.Save();
            //base.Create(entity);
        }
        public void UpdatePersonaPlan(PersonaPlan source, PersonaPlan target)
        {
            this.Copy(source, target);
            _userPlanRepository.Save();

        }
        public TrackObjectChange TrackingChange(PersonaPlan source, PersonaPlan target, int client_profile_id, string version)
        {           
            List<TrackPropertyChange> list = GetPropertyChange(source, target,version);
            
            if (list.Count > 0)
            {
                TrackObjectChange personaChange = new TrackObjectChange();
                personaChange.id = source.id;
                personaChange.type = "CHANGE_PERSONA_PLAN";
                personaChange.listchange = list;
                string name = "CHANGE_" + list[0].fieldname.ToUpper();               
                return personaChange;
            }
            if (source.dreams.Count > 0)
            {
                TrackObjectChange dreamchange = GetDreamChange(source, target);
                if (dreamchange != null)
                {
                    if (dreamchange.listchange.Count == 1 && dreamchange.listchange[0].fieldname == "purchase_age")
                    {
                        dreamchange.type = "MOVE_DREAM_PURCHAGE";                        
                    }
                    else
                    {
                        dreamchange.type = "EDIT_DREAM";                       
                    }
                    return dreamchange;
                }

            }
            if (source.lifeEvent.Count > 0)
            {
                TrackObjectChange lvchange = GetLifeEventChange(source, target,version);
                if (lvchange != null)
                {
                    if (lvchange.listchange.Count == 1 && lvchange.listchange[0].fieldname == "starting_age")
                    {
                        lvchange.type = "MOVE_LIFEEVENT_PURCHAGE";                        
                    }
                    else
                    {
                        lvchange.type = "EDIT_LIFEEVENT";                    
                    }
                    return lvchange;
                }

            }
            return null;
        }
        public List<TrackPropertyChange> GetPropertyChange(PersonaPlan source, PersonaPlan target, string version)
        {
            List<TrackPropertyChange> list = new List<TrackPropertyChange>();
            if (source == null)
                source = new PersonaPlan();
            if (target == null)
                target = new PersonaPlan(); 

            Type type = typeof(PersonaPlan);
            List<string> exludefield = new List<string>() { "dreams", "lifeEvent", "saving_today" };
            if (version == "3" || version == "4")
            {
                exludefield.Add("income_today");
                exludefield.Add("expense_today");
                exludefield.Add("expense_at_retirement");
            }
            IEnumerable<PropertyInfo> props = type.GetProperties().Where(p => !exludefield.Contains(p.Name));
            if (props != null && props.Count() > 0)
            {
                foreach (PropertyInfo prop in props)
                {
                    var srcValue = source.GetType().GetProperty(prop.Name).GetValue(source);
                    var targetValue = target.GetType().GetProperty(prop.Name).GetValue(target);
                    if (srcValue != null && srcValue.GetType() == typeof(decimal) && targetValue != null && targetValue.GetType() == typeof(decimal))
                    {
                        srcValue = Math.Truncate((decimal)srcValue * 10000) / 10000;
                        targetValue = Math.Truncate((decimal)targetValue * 10000) / 10000;
                    }
                    if (srcValue != null && targetValue != null && !srcValue.Equals(targetValue))
                    {
                        list.Add(new TrackPropertyChange() { fieldname = prop.Name, fromvalue = targetValue.ToString(), tovalue = srcValue.ToString() });
                    }
                }
            }
            return list;
        }
        public TrackObjectChange GetDreamChange(PersonaPlan source, PersonaPlan target)
        {
            TrackObjectChange change = new TrackObjectChange();

            foreach (Dream dr in source.dreams)
            {
                Dream tg = target.dreams.Where(t => t.id == dr.id).FirstOrDefault();
                if (tg != null)
                {
                    Type type = typeof(Dream);
                    IEnumerable<string> exludefield = new List<string>() { "dream_type", "persona_plan", "sell_age", "purchase_year", "sell_year", "ranking_index", "photoContent" };
                    IEnumerable<PropertyInfo> props = type.GetProperties().Where(p => !exludefield.Contains(p.Name));
                    List<TrackPropertyChange> sublist = new List<TrackPropertyChange>();
                    foreach (PropertyInfo prop in props)
                    {
                        var srcValue = dr.GetType().GetProperty(prop.Name).GetValue(dr);
                        var targetValue = tg.GetType().GetProperty(prop.Name).GetValue(tg);
                        if (srcValue != null && srcValue.GetType() == typeof(decimal))
                        {
                            srcValue = Math.Truncate((decimal)srcValue * 10000) / 10000;
                            targetValue = Math.Truncate((decimal)targetValue * 10000) / 10000;
                        }
                        if (srcValue != null && !srcValue.Equals(targetValue))
                        {
                            sublist.Add(new TrackPropertyChange() { fieldname = prop.Name, fromvalue =targetValue==null?null: targetValue.ToString(), tovalue = srcValue.ToString() });
                        }
                    }
                    if (sublist.Count > 0)
                    {
                        change.id = dr.id;
                        change.listchange = sublist;
                        return change;
                    }

                }
            }
            return null;
        }
        public TrackObjectChange GetLifeEventChange(PersonaPlan source, PersonaPlan target, string version)
        {
            TrackObjectChange change = new TrackObjectChange();

            foreach (LifeEvent dr in source.lifeEvent)
            {
                LifeEvent tg = target.lifeEvent.Where(t => t.id == dr.id).FirstOrDefault();
                if (tg != null)
                {
                    Type type = typeof(LifeEvent);
                    List<string> exludefield = new List<string>() { "dream_type", "persona_plan", "starting_year", "ranking_index", "photoContent", "age_dependent" };
                    if (version == "3" || version == "4")
                    {
                        exludefield.Add("yearly_cost_reduction");
                    }
                    IEnumerable<PropertyInfo> props = type.GetProperties().Where(p => !exludefield.Contains(p.Name));
                    List<TrackPropertyChange> sublist = new List<TrackPropertyChange>();
                    foreach (PropertyInfo prop in props)
                    {
                        var srcValue = dr.GetType().GetProperty(prop.Name).GetValue(dr);
                        var targetValue = tg.GetType().GetProperty(prop.Name).GetValue(tg);
                        if (srcValue != null && srcValue.GetType() == typeof(decimal))
                        {
                            srcValue = Math.Truncate((decimal)srcValue * 10000) / 10000;
                            targetValue = Math.Truncate((decimal)targetValue * 10000) / 10000;
                        }
                        if (srcValue != null  && !srcValue.Equals(targetValue))
                        {
                            sublist.Add(new TrackPropertyChange() { fieldname = prop.Name, fromvalue = targetValue == null ? null : targetValue.ToString(), tovalue = srcValue.ToString() });
                        }
                    }
                    if (sublist.Count > 0)
                    {
                        change.id = dr.id;
                        change.listchange = sublist;
                        return change;
                    }

                }
            }
            return null;
        }
        public PersonaPlan Copy(PersonaPlan source, PersonaPlan target)
        {
            target.income_today = source.income_today;
            target.expense_today = source.expense_today;
            target.current_saving = source.current_saving;
            target.inflation = source.inflation;
            target.salary_evolution = source.salary_evolution;
            target.start_age = source.start_age;
            target.start_year = source.start_year;
            target.retirement_age = source.retirement_age;
            target.social_security_age = source.social_security_age;
            target.death_age = source.death_age;
            target.expense_at_retirement = (source.expense_at_retirement != null ? source.expense_at_retirement : 0);
            target.social_security_percent = source.social_security_percent;
            target.volatility = source.volatility == null ? 0.16M : source.volatility;
            target.risk_return = source.risk_return == null ? 0.08M : source.risk_return;
            target.mc_bottom_value = source.mc_bottom_value;
            target.mc_top_value = source.mc_top_value;
            target.number_trials = source.number_trials;
            target.currency_code = source.currency_code;
            target.retirement_lifestyle = source.retirement_lifestyle;
            int nDreamCount = source.dreams != null ? source.dreams.Count : 0;
            for (int i = 0; i < nDreamCount; i++)
            {
                Dream dream;
                if (target.dreams.ElementAt(i) != null)
                {                    
                    dream = target.dreams.ElementAt(i);
                    if (dream.purchase_age < source.start_age)
                        dream.purchase_age = (int)source.start_age;
                    dream = DreamService.Copy(source.dreams.ElementAt(i), dream);

                }
            }
            int nLifeCount = source.lifeEvent != null ? source.lifeEvent.Count : 0;
            for (int i = 0; i < nLifeCount; i++)
            {
                LifeEvent ev;

                if (target.lifeEvent.ElementAt(i) != null)
                {
                    ev = target.lifeEvent.ElementAt(i);
                    if (ev.starting_age < source.start_age)
                        ev.starting_age = (int)source.start_age;
                    ev = LifeEventService.Copy(source.lifeEvent.ElementAt(i), ev);
                }
            }
            return target;
        }
       
        public List<PersonaPlan> GetAllData()
        {
            return _userPlanRepository.GetAllData();
        }

        public PersonaPlan ResetPlan(string user_id,int status)
        {            
            return _userPlanRepository.ResetPlan(user_id,status);
        }
        public PersonaPlan GetCurrentPlanByUserId(Guid userId)
        {
            return _userPlanRepository.GetCurrentPlanByUserId(userId);
        }


        public int DeleteAllByUserId(Guid userId)
        {
            return _userPlanRepository.DeleteAllByUserId(userId);
        }


        public int ImportFromList(IList<PersonaPlan> listPlan)
        {

            foreach (var item in listPlan)
            {
                foreach(Dream dr in item.dreams)                
                    dr.dream_type = null;                
                foreach (LifeEvent ev in item.lifeEvent)
                    ev.dream_type = null;
                _userPlanRepository.Add(item);
            }
            return _userPlanRepository.SaveChange();
        }
        public List<Scenario> GetListScenario(Guid user_id)
        {
            return _userPlanRepository.GetListScenario(user_id);
        }
        public PersonaPlan CreatePersonaPlanFromAnother(int id, string name)
        {
            PersonaPlan source = GetById(id);
            if (source != null)
            {
                PersonaPlan target = new PersonaPlan(source);

                target.name = name;
                target.status = null;

                _userPlanRepository.Add(target);
                _userPlanRepository.Save();
                return target;
            }
            return null;
        }
        public List<PersonaPlan> DuplicateScenarios(List<Scenario> scenarios)
        {
            List<PersonaPlan> list = new List<PersonaPlan>();            
            foreach (Scenario sc in scenarios)
            {
                string name = sc.name + " – copy";
                PersonaPlan plan = CreatePersonaPlanFromAnother(sc.id, name);
                list.Add(plan);
            }
            return list;
        }
        public void DeleteScenarios(List<Scenario> scenarios)
        {
            int[] arr = new int[scenarios.Count];
            int i = 0;
            foreach (Scenario sc in scenarios)
            {
                //string name = sc.name + " – copy";
                //CreatePersonaPlanFromAnother(sc.id, name);
                arr[i] = sc.id;
                i++;
            }
            _userPlanRepository.DeleteByListIds(arr);
        }
        public List<Scenario> MigrateFromPersonaPlan(List<PersonaPlan> listPlan)
        {
            List<Scenario> result = new List<Scenario>();
            foreach (PersonaPlan personaPlan in listPlan)
            {
                result.Add(new Scenario(personaPlan));
            }
            return result;
        }
        public List<PersonaPlan> InsertDefaultPersonaPlan(string user_id, int status)
        {
            return _userPlanRepository.InsertDefaultPersonaPlan(user_id, status);
        }
        public PersonaPlan LoadSaveSolution(int solution_id)
        {
            return _userPlanRepository.LoadSaveSolution(solution_id);
        }
    }
}
