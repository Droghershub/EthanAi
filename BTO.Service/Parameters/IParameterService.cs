using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface IParameterService : IEntityService<Parameter>
    {
        Parameter GetById(int Id);
        List<Parameter> GetByProductVersionId(int productVersionId);
        List<Parameter> GetDefault();
        List<Parameter> GetByParentId(int Id);
        List<Parameter> GetAllByProductVersionId(int productVersionId);
        List<Parameter> GetByTopParentId(int topParentId);
        object UpdateTree(Parameter parameter);
        void DeleteTopParentId(int topParentId);
        object UpdateParameterTypeList(Parameter dataInput, IListItemService listItemService);
        List<Parameter> GetParametersForUser(string user_id);
        List<Parameter> GetParametersForUserProfile(string user_id);
        List<Parameter> GetParameterNotFromRuleByProductVersionId(int productVersionId);
        List<Parameter> UpdateParameterFromRule(int @productVersionId, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList);
    }
}
