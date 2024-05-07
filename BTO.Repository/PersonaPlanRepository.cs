using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public class PersonaPlanRepository : GenericRepository<PersonaPlan>, IPersonaPlanRepository
    {
        public PersonaPlanRepository(DbContext context)
            : base(context)
        {
           
        }
        public PersonaPlan GetById(int id)
        {            
            PersonaPlan persona = _entities.Set<PersonaPlan>().Where(x=>x.id== id).Include(y=>y.dreams).Include(z=>z.lifeEvent).FirstOrDefault();            
            return persona;
        }
        public List<PersonaPlan> GetByGuid(Guid user_id)
        {
            return FindBy(x=>x.user_id==user_id).ToList();
        }
        public List<PersonaPlan> GetAllData()
        {
            return _entities.Set<PersonaPlan>().ToList();
        } 
        public PersonaPlan GetCurrentPlanByUserId(Guid userId)
        {
            return FindBy(t => t.user_id.Equals(userId) && t.status == Model.Common.ScenarioType.Current).FirstOrDefault();
        }
        public List<Scenario> GetListScenario(Guid user_id)
        {
            List<Scenario> list = new List<Scenario>();
            IEnumerable<PersonaPlan> personas = FindBy(x => x.user_id == user_id).OrderBy(x=>x.status == null).ThenBy(t=>t.status).ThenBy(y=>y.time_create);
            foreach (PersonaPlan persona in personas)
            {
                Scenario scenario = new Scenario(persona);
                list.Add(scenario);
            }
            return list;
        }


        public int DeleteAllByUserId(Guid userId)
        {
            Delete(t => t.user_id.Equals(userId));
            _entities.SaveChanges();
            return 1 ;
        }
        public void DeleteByListIds(int[] ids)
        {
            //return _entities.Set<PersonaPlan>().Where(x=>ids.Contains(x.id)).ToList();
            Delete(t => ids.Contains(t.id));
            _entities.SaveChanges();
        }
        public List<PersonaPlan> InsertDefaultPersonaPlan(string user_id,int status)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id",user_id);
            var statusParam = new System.Data.SqlClient.SqlParameter("@status",status);
            return _entities.Database.SqlQuery<PersonaPlan>("InsertDefaultPersonaPlan @user_id, @status", userparam, statusParam).ToList();
        }
        public PersonaPlan ResetPlan(string user_id, int status)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            var statusParam = new System.Data.SqlClient.SqlParameter("@status", status);
            return _entities.Database.SqlQuery<PersonaPlan>("ResetUserPlanToDefault @user_id, @status", userparam, statusParam).FirstOrDefault();
        }
        public PersonaPlan LoadSaveSolution(int solution_id)
        {
            var solutionparam = new System.Data.SqlClient.SqlParameter("@solutionid", solution_id);

            return _entities.Database.SqlQuery<PersonaPlan>("LoadSaveSolution @solutionid", solutionparam).FirstOrDefault();
        }
    }
}
