using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;

namespace BTO.Repository
{
    public interface IParameterRepository : IGenericRepository<Parameter>
    {
        Parameter GetById(int id);
        List<Parameter> GetByTopParentId(int topParentId);
        void DeleteByListIds(List<int> ids);
        void DeleteTopParentId(int topParentId);
        List<Parameter> GetParametersForUser(string user_id);
        List<Parameter> GetParametersForUserProfile(string user_id);
        List<Parameter> UpdateParameterFromRule(int @productVersionId, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList);
    }
}
