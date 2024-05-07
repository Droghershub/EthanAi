using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;
using BTO.Model.UserManagement;

namespace BTO.Repository
{
    public class FunctionAccessRepository : GenericRepository<FunctionAccess>, IFunctionAccessRepository
    {
        public FunctionAccessRepository(DbContext context)
            : base(context)
        {
           
        }
        public FunctionAccess GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
        public List<FunctionAccessModel> GetFunctionUserAccess(string user_id)
        {
            var userParam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            return _entities.Database.SqlQuery<FunctionAccessModel>("LoadFunctionsForUser @user_id", userParam).ToList();
            
        }
    }
}
