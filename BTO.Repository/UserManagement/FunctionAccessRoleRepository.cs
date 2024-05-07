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
    public class FunctionAccessRoleRepository : GenericRepository<FunctionAccessRole>, IFunctionAccessRoleRepository
    {
        public FunctionAccessRoleRepository(DbContext context)
            : base(context)
        {
           
        }
        public FunctionAccessRole GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }

        public FunctionAccessRoleModel GetByRoleId(int role_id)
        {
            FunctionAccessRoleModel model = new FunctionAccessRoleModel();
            model.role_id = role_id;
            var roleparam = new System.Data.SqlClient.SqlParameter("@role_id", role_id);

            model.functions = _entities.Database.SqlQuery<FunctionAccessModel>("LoadFunctionsForRole @role_id", roleparam).ToList();            
            return model;
        }
        public FunctionAccessRoleModel UpdateFunctionAccessRole(FunctionAccessRoleModel model)
        {
            string str = BTO.Common.Utils.ToXML(model.ParseToDbModel());
            var roleparam = new System.Data.SqlClient.SqlParameter("@role_id", model.role_id);
            var dataparam = new System.Data.SqlClient.SqlParameter("@xmldata", str);
            model.functions = _entities.Database.SqlQuery<FunctionAccessModel>("UpdateFunctionsForRole @role_id, @xmldata", roleparam,dataparam).ToList(); 
            return model;
        }
    }
}
