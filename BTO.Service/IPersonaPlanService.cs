using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Model.Tracking;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface IPersonaPlanService : IEntityService<PersonaPlan>
    {
        PersonaPlan GetById(int Id);
        List<PersonaPlan> GetByGuid(Guid user_id);
       
        PersonaPlan Copy(PersonaPlan source, PersonaPlan target);
        void UpdatePersonaPlan(PersonaPlan source, PersonaPlan target);
        TrackObjectChange TrackingChange(PersonaPlan source, PersonaPlan target, int client_profile_id,string version);
        List<TrackPropertyChange> GetPropertyChange(PersonaPlan source, PersonaPlan target, string version);
        TrackObjectChange GetDreamChange(PersonaPlan source, PersonaPlan target);
        TrackObjectChange GetLifeEventChange(PersonaPlan source, PersonaPlan target, string version);
        List<PersonaPlan> GetAllData(); 
        PersonaPlan ResetPlan(string user_id,int status);
        PersonaPlan GetCurrentPlanByUserId(Guid userId);

        int DeleteAllByUserId(Guid guid);

        int ImportFromList(IList<PersonaPlan> listPlan);
        List<Scenario> GetListScenario(Guid user_id);
        PersonaPlan CreatePersonaPlanFromAnother(int id, string name);
        List<PersonaPlan> DuplicateScenarios(List<Scenario> scenarios);
        void DeleteScenarios(List<Scenario> scenarios);
        List<Scenario> MigrateFromPersonaPlan(List<PersonaPlan> listPlan);
        List<PersonaPlan> InsertDefaultPersonaPlan(string user_id, int status);
        PersonaPlan LoadSaveSolution(int solution_id);
    }
}
