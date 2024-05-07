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
    public class OrganizationUnitRoleService : EntityService<OrganizationUnitRole>, IOrganizationUnitRoleService
    {
        IUnitOfWork _unitOfWork;
        IOrganizationUnitRoleRepository _organizationUnitRoleRepository;

        public OrganizationUnitRoleService(IUnitOfWork unitOfWork, IOrganizationUnitRoleRepository organizationUnitRoleRepository)
            : base(unitOfWork, organizationUnitRoleRepository)
        {
            _unitOfWork = unitOfWork;
            _organizationUnitRoleRepository = organizationUnitRoleRepository;
        }


        public OrganizationUnitRole GetById(int Id)
        {
            return _organizationUnitRoleRepository.GetById(Id);
        }

        public RolePermission GetByOrganizationUnitId(int id)
        {
            return _organizationUnitRoleRepository.GetByOrganizationUnitId(id);
        }

        public bool UpdateOrganizationUnitRole(List<OrganizationUnitRole> organizationUnitRoles)
        {
            if (organizationUnitRoles.Count()>0)
            {
                _organizationUnitRoleRepository.DeleteByOrganizationUnitIdAndStatus(organizationUnitRoles[0].organization_unit_id, organizationUnitRoles[0].role_status);

                _organizationUnitRoleRepository.BulkInsert("um_organization_unit_role", organizationUnitRoles.Where(x=>x.role_id > 0).ToList());

                _organizationUnitRoleRepository.DeleteOrganizationUnitRoleUser(organizationUnitRoles[0].organization_unit_id);
            }
            return true;
        }
    }
}
