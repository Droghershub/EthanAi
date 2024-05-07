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
    public class FunctionAccessService : EntityService<FunctionAccess>, IFunctionAccessService
    {
        IUnitOfWork _unitOfWork;
        IFunctionAccessRepository _functionAccessRepository;

        public FunctionAccessService(IUnitOfWork unitOfWork, IFunctionAccessRepository functionAccessRepository)
            : base(unitOfWork, functionAccessRepository)
        {
            _unitOfWork = unitOfWork;
            _functionAccessRepository = functionAccessRepository;
        }


        public FunctionAccess GetById(int Id)
        {
            return _functionAccessRepository.GetById(Id);
        }

        public List<FunctionAccessModel> GetFunctionUserAccess(string user_id)
        {
            return _functionAccessRepository.GetFunctionUserAccess(user_id);
        }
    }
}
