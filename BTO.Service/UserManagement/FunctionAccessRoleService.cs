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
using BTO.Model.UserManagement;
namespace BTO.Service
{
    public class FunctionAccessRoleService : EntityService<FunctionAccessRole>, IFunctionAccessRoleService
    {
        IUnitOfWork _unitOfWork;
        IFunctionAccessRoleRepository _functionAccessRoleRepository;

        public FunctionAccessRoleService(IUnitOfWork unitOfWork, IFunctionAccessRoleRepository functionAccessRoleRepository)
            : base(unitOfWork, functionAccessRoleRepository)
        {
            _unitOfWork = unitOfWork;
            _functionAccessRoleRepository = functionAccessRoleRepository;
        }


        public FunctionAccessRole GetById(int Id)
        {
            return _functionAccessRoleRepository.GetById(Id);
        }
        public FunctionAccessRoleModel GetByRoleId(int role_id)
        {
            return _functionAccessRoleRepository.GetByRoleId(role_id);
        }
        public FunctionAccessRoleModel UpdateFunctionAccessRole(FunctionAccessRoleModel model)
        {
            return _functionAccessRoleRepository.UpdateFunctionAccessRole(model);
        }
    }
}
