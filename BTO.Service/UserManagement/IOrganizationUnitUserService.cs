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
    public interface IOrganizationUnitUserService : IEntityService<OrganizationUnitUser>
    {
        OrganizationUnitUser GetById(int Id);
        List<AspNetUserDTO> GetAvailableUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch);
        List<AspNetUserDTO> GetAssignedUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch);
        bool AddUserToOrganizationUnit(List<OrganizationUnitUser> organizationUnitUser);
        bool DeleteAssignedUsersOfOrganizationUnit(string organization_unit_ids);
        bool UpdateOrganizationUnitUser(OrganizationUnitUser _organizationUnitUser);
        IList<string> GetUiVersionByUserId(string user_id);
    }
}
