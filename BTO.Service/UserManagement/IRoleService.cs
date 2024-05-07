using BTO.Model.UserManagement;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.UserManagement
{
    public interface IRoleService : IEntityService<Role>
    {
        List<Role> GetAll();
        int Delete(int id);
        int Update(Role role);
        Role GetById(int id); 
        Role AddRole(Role role);
        object GetRolesOfUsersInOrganizationUnit(string user_id, int organization_unit_id);
    }
}
