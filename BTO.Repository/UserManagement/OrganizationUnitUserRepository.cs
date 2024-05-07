using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;
using BTO.Model.UserManagement;

namespace BTO.Repository
{
    public class OrganizationUnitUserRepository : GenericRepository<OrganizationUnitUser>, IOrganizationUnitUserRepository
    {
        public OrganizationUnitUserRepository(DbContext context)
            : base(context)
        {
           
        }
        public OrganizationUnitUser GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }

        public List<AspNetUserDTO> GetAvailableUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch)
        {
            var para_organization_unit_id = new System.Data.SqlClient.SqlParameter("@organization_unit_id", organization_unit_id);
            var para_start = new System.Data.SqlClient.SqlParameter("@start", start);
            var para_number = new System.Data.SqlClient.SqlParameter("@number", number);
            var para_textsearch = new System.Data.SqlClient.SqlParameter("@textsearch", textsearch);
            return this._entities.Database.SqlQuery<AspNetUserDTO>("GetAvailableUsersOfOrganizationUnit @organization_unit_id, @start, @number,@textsearch", para_organization_unit_id, para_start, para_number, para_textsearch).ToList();
        }

        public List<AspNetUserDTO> GetAssignedUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch)
        {
            var para_organization_unit_id = new System.Data.SqlClient.SqlParameter("@organization_unit_id", organization_unit_id);
            var para_start = new System.Data.SqlClient.SqlParameter("@start", start);
            var para_number = new System.Data.SqlClient.SqlParameter("@number", number);
            var para_textsearch = new System.Data.SqlClient.SqlParameter("@textsearch", textsearch);
            return this._entities.Database.SqlQuery<AspNetUserDTO>("GetAssignedUsersOfOrganizationUnit @organization_unit_id, @start, @number,@textsearch", para_organization_unit_id, para_start, para_number, para_textsearch).ToList();
        }
        public bool DeleteAssignedUsersOfOrganizationUnit(string organization_unit_ids)
        {
            var para_organization_unit_ids = new System.Data.SqlClient.SqlParameter("@organization_unit_ids", @organization_unit_ids);
            this._entities.Database.ExecuteSqlCommand("DeleteAssignedUsersOfOrganizationUnit @organization_unit_ids", para_organization_unit_ids);
            return true;
        } 
        public IList<string> GetUiVersionByUserId(string user_id)
        {
            var para_user_id = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            return this._entities.Database.SqlQuery<string>("GetUiVersionByUserId @user_id", para_user_id).ToList();
        }
    }
}
