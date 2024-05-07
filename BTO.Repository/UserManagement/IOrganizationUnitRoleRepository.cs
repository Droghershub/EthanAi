using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
using BTO.Model.UserManagement;

namespace BTO.Repository
{
    public interface IOrganizationUnitRoleRepository : IGenericRepository<OrganizationUnitRole>
    {
        OrganizationUnitRole GetById(int id);
        RolePermission GetByOrganizationUnitId(int id);
        void DeleteByOrganizationUnitIdAndStatus(int _organization_unit_id, int status);
        bool DeleteOrganizationUnitRoleUser(int _organization_unit_id);
    }
}
