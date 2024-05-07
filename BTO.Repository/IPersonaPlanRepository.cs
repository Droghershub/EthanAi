using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
namespace BTO.Repository
{
    public interface IPersonaPlanRepository : IGenericRepository<PersonaPlan>
    {
        PersonaPlan GetById(int id);
        List<PersonaPlan> GetByGuid(Guid user_id);
        List<PersonaPlan> GetAllData();
        PersonaPlan GetCurrentPlanByUserId(Guid userId);

        int DeleteAllByUserId(Guid userId);

        List<Scenario> GetListScenario(Guid user_id);
        void DeleteByListIds(int[] ids);
        List<PersonaPlan> InsertDefaultPersonaPlan(string user_id, int status);
        PersonaPlan ResetPlan(string user_id,int status);
        PersonaPlan LoadSaveSolution(int solution_id);
    }
}
