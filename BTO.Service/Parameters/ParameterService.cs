using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;
using BTO.Common;
using System.Reflection;
using System.Transactions;
namespace BTO.Service
{
    public class ParameterService : EntityService<Parameter>, IParameterService
    {
        IUnitOfWork _unitOfWork;
        IParameterRepository _parameterRepository;

        public ParameterService(IUnitOfWork unitOfWork, IParameterRepository parameterRepository)
            : base(unitOfWork, parameterRepository)
        {
            _unitOfWork = unitOfWork;
            _parameterRepository = parameterRepository;
        }


        public Parameter GetById(int Id)
        {
            return _parameterRepository.GetById(Id);
        }

        public List<Parameter> GetByParentId(int Id)
        {
            return _parameterRepository.FindBy(x => x.parent_id == Id).ToList();
        }

        public List<Parameter> GetParameterNotFromRuleByProductVersionId(int productVersionId)
        {
            return _parameterRepository.FindBy(x => x.product_version_id == productVersionId && x.name.IndexOf("rule_") != 0).ToList();
        }

        public List<Parameter> GetByProductVersionId(int productVersionId)
        {
            return _parameterRepository.FindBy(x => x.product_version_id == productVersionId && x.parent_id == null).ToList();            
        }
        public List<Parameter> GetAllByProductVersionId(int productVersionId)
        {
            return _parameterRepository.FindBy(x => x.product_version_id == productVersionId).OrderBy(t => t.parent_id).ToList();
        }
        public List<Parameter> GetDefault()
        {
            return _parameterRepository.FindBy(x => x.productVersion.is_default == true && x.type == CommonTypes.PARAMETER_LIST).ToList();
        }

        public List<Parameter> GetByTopParentId(int topParentId)
        {
            return _parameterRepository.GetByTopParentId(topParentId);
        }
        public object UpdateTree(Parameter parameter)
        {
            List<Parameter> outlist = new List<Parameter>();
            using (TransactionScope scope = new TransactionScope())
            {

                List<Parameter> originalList = _parameterRepository.GetByTopParentId(parameter.id);
                if (parameter.nodes.Count > 0)
                {
                    if(parameter.id == 0)
                    {
                        parameter.deleteable = true;
                        parameter.nodes[0].deleteable = true;
                    }
                    parameter.nodes[0].description = parameter.description;
                    parameter.nodes[0].method = parameter.method;
                    parameter.nodes[0].parent_id = null;
                }
                RecursiveTreeList(outlist, originalList, parameter);
                List<int> listIdDelete = new List<int>();
                foreach (Parameter para in originalList)
                {
                    if (outlist.Where(x => x.id == para.id).FirstOrDefault() == null)
                    {
                        listIdDelete.Add(para.id);
                        //delete here
                    }
                }
                if (listIdDelete.Count > 0)
                    _parameterRepository.DeleteByListIds(listIdDelete);
                scope.Complete();
                return outlist;
            }
            
        }
        private void RecursiveTreeList(List<Parameter> outlist, List<Parameter> originalList, Parameter parameter)
        {
            if (parameter.nodes != null && parameter.nodes.Count > 0)
            {
                var parent_id = parameter.id == 0 ? (int?)null : parameter.id;
                foreach (Parameter item in parameter.nodes)
                {
                    if ( item.id == 0) //add
                    {
                        item.deleteable = true;
                        if (item.parent_id == null || item.parent_id == 0)
                            item.parent_id = parent_id;
                        this.Create(item);
                    }
                    else
                    {
                        Parameter original = originalList.Where(x => x.id == item.id).FirstOrDefault();
                        if (isParameterChange(item, original))
                        {
                            original = CopyDataForUpdate(item, original);
                            this.Update(original);
                        }
                    }
                    outlist.Add(item);

                    RecursiveTreeList(outlist, originalList, item);
                }
            }

        }
        private bool isParameterChange(Parameter param, Parameter original)
        {
            Type type = typeof(Parameter);
            IEnumerable<string> exludefield = new List<string>() { "id", "nodes", "listItems", "productVersion", "product_version_id" };
            IEnumerable<PropertyInfo> props = type.GetProperties().Where(p => !exludefield.Contains(p.Name));
            foreach (PropertyInfo prop in props)
            {
                var srcValue = original.GetType().GetProperty(prop.Name).GetValue(original);
                var targetValue = param.GetType().GetProperty(prop.Name).GetValue(param);
                if ((srcValue == null && targetValue != null) || (srcValue != null && targetValue == null))
                    return true;
                if (srcValue != null && targetValue != null && !srcValue.Equals(targetValue))
                    return true;
            }
            return false;
        }
        private Parameter CopyDataForUpdate(Parameter param, Parameter original)
        {
            Type type = typeof(Parameter);
            IEnumerable<string> exludefield = new List<string>() { "id", "nodes", "listItems", "productVersion", "product_version_id" };
            IEnumerable<PropertyInfo> props = type.GetProperties().Where(p => !exludefield.Contains(p.Name));
            foreach (PropertyInfo prop in props)
            {
                var targetValue = param.GetType().GetProperty(prop.Name).GetValue(param);
                prop.SetValue(original, targetValue, null);

            }
            return original;
        }

        public void DeleteTopParentId(int topParentId)
        {
            _parameterRepository.DeleteTopParentId(topParentId);
        }
        public object UpdateParameterTypeList(Parameter dataInput,IListItemService listItemService)
        {
            using (TransactionScope scope = new TransactionScope())
            {
                if (dataInput.id == 0)
                {
                    dataInput.deleteable = true;
                    this.Create(dataInput);
                }
                else
                {
                    List<ListItem> items = listItemService.GetByParameterId(dataInput.id).ToList();
                    if (items.Count > 0)
                        listItemService.DeleteAll(items);
                    for (int j = 0; j < dataInput.listItems.Count; j++)
                    {
                        ListItem item = dataInput.listItems.ElementAt(j);
                        item.parameter_id = dataInput.id;
                        listItemService.Create(item);
                    }
                    items = listItemService.GetByParameterId(dataInput.id).ToList();
                    dataInput.listItems = items;
                }

                Parameter dataupdate = this.GetById(dataInput.id);
                dataupdate.default_value = dataInput.default_value;
                dataupdate.description = dataInput.description;
                dataupdate.editable = dataInput.editable;
                dataupdate.max_value = dataInput.max_value;
                dataupdate.method = dataInput.method;
                dataupdate.min_value = dataInput.min_value;
                dataupdate.name = dataInput.name;
                this.Update(dataupdate);
                scope.Complete();
                return dataupdate;
            }            
        }
        public List<Parameter> GetParametersForUser(string user_id)
        {
            return _parameterRepository.GetParametersForUser(user_id);
        }
        public List<Parameter> GetParametersForUserProfile(string user_id)
        {
            return _parameterRepository.GetParametersForUserProfile(user_id);
        }
        public List<Parameter> UpdateParameterFromRule(int @productVersionId, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList)
        {
            return _parameterRepository.UpdateParameterFromRule(@productVersionId, name_value_parametterList, name_parent_parametterList, name_issum_parametterList, name_isformular_parametterList);
        }

    }
}
