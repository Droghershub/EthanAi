using BTO.Model;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository
{
    public class SolutionRepository : GenericRepository<Solution>, ISolutionRepository
    {
        public SolutionRepository(DbContext context) : base(context)
        {

        }


        public Boolean DeleteList(int[] listInput)
        { 
            Delete(a => listInput.Contains(a.id));
            this.Save(); 
            return true; 
        }


        public Solution GetById(int id)
        {
            return FindBy(t=>t.id == id).FirstOrDefault();
        }
        public Solution GetByIdWithData(int id)
        {
            return FindBy(t => t.id == id).FirstOrDefault();
        }


        public List<Solution> GetAllByUserId(Guid userId)
        {
            var obj = _dbset.Select(t => new
            {
                t.id,
                t.name,
                t.time_create,
                t.type,
                t.user_id,
                t.version
            }).Where(t => t.user_id == userId).AsEnumerable().Select(x => new Solution(){
             id = x.id,
             version = x.version,
             type = x.type,
             time_create =  x.time_create,
             name = x.name,
             user_id = x.user_id
            }).OrderByDescending(t=>t.time_create).ThenByDescending(t=>t.version).ToList(); 
            return obj;
        } 
        public int GetCurrentVersionByUserId(Guid guid)
        {
           var obj =  _dbset.Where(t => t.user_id == guid).Max(t => t.version);
           if (obj.HasValue)
               return obj.Value;
           return 0;
        }
        public Solution SaveSolution(Solution item)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id", item.user_id);
            var nameParam = new System.Data.SqlClient.SqlParameter("@name", item.name);
            var typeParam = new System.Data.SqlClient.SqlParameter("@type", item.type);
            var time_createParam = new System.Data.SqlClient.SqlParameter("@time_create", item.time_create);
            return _entities.Database.SqlQuery<Solution>("SaveSolutions @user_id, @name, @type, @time_create", userparam, nameParam, typeParam, time_createParam).FirstOrDefault();
        }
        
    }
}
