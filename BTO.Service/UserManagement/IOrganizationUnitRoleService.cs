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
    public interface IOrganizationUnitRoleService : IEntityService<OrganizationUnitRole>
    {
        OrganizationUnitRole GetById(int Id);
        RolePermission GetByOrganizationUnitId(int id);
        bool UpdateOrganizationUnitRole(List<OrganizationUnitRole> organizationUnitRoles);
    }
}
