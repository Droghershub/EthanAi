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
    public class OrganizationUnitService : EntityService<OrganizationUnit>, IOrganizationUnitService
    {
        IUnitOfWork _unitOfWork;
        IOrganizationUnitRepository _organizationUnitRepository;

        public OrganizationUnitService(IUnitOfWork unitOfWork, IOrganizationUnitRepository organizationUnitRepository)
            : base(unitOfWork, organizationUnitRepository)
        {
            _unitOfWork = unitOfWork;
            _organizationUnitRepository = organizationUnitRepository;
        }


        public OrganizationUnit GetById(int Id)
        {
            return _organizationUnitRepository.GetById(Id);
        }

        public void DeleteTopParentId(int topParentId)
        {
            _organizationUnitRepository.DeleteTopParentId(topParentId);
        }

    }
}
