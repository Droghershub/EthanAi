using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;
using BTO.Model.UserManagement;

namespace BTO.Service
{
    public interface IFunctionAccessService : IEntityService<FunctionAccess>
    {
        FunctionAccess GetById(int Id);
        List<FunctionAccessModel> GetFunctionUserAccess(string user_id);
    
    }
}
