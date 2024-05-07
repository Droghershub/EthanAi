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
    public interface IFunctionAccessRoleService : IEntityService<FunctionAccessRole>
    {
        FunctionAccessRole GetById(int Id);
        FunctionAccessRoleModel GetByRoleId(int role_id);
        FunctionAccessRoleModel UpdateFunctionAccessRole(FunctionAccessRoleModel model);
    }
}
