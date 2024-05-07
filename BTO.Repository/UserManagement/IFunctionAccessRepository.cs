using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
using BTO.Model.UserManagement;

namespace BTO.Repository
{
    public interface IFunctionAccessRepository : IGenericRepository<FunctionAccess>
    {
        FunctionAccess GetById(int id);
        List<FunctionAccessModel> GetFunctionUserAccess(string user_id);
    }
}
