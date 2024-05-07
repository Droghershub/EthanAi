using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
using BTO.Model.UserManagement;

namespace BTO.Repository
{
    public interface IOrganizationUnitUserRepository : IGenericRepository<OrganizationUnitUser>
    {
        OrganizationUnitUser GetById(int id);
        List<AspNetUserDTO> GetAvailableUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch);
        List<AspNetUserDTO> GetAssignedUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch);
        bool DeleteAssignedUsersOfOrganizationUnit(string organization_unit_ids);
        IList<string> GetUiVersionByUserId(string user_id);
    }
}
