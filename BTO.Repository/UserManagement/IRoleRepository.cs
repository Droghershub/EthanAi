using BTO.Model.UserManagement;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.UserManagement
{
    public interface IRoleRepository : IGenericRepository<Role>
    {
        List<Role> GetAllRole();
        Role GetById(int id);
        int Delete(int id);
        int Update(Role role);
        Role AddRole(Role role);
        List<RoleDTO> GetRolesOfUsersInOrganizationUnit(string user_id, int organization_unit_id);
    }
}
