using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
using BTO.Model.UserManagement;

namespace BTO.Repository
{
    public interface IFunctionAccessRoleRepository : IGenericRepository<FunctionAccessRole>
    {
        FunctionAccessRole GetById(int id);
        FunctionAccessRoleModel GetByRoleId(int role_id);
        FunctionAccessRoleModel UpdateFunctionAccessRole(FunctionAccessRoleModel model);
    }
}
