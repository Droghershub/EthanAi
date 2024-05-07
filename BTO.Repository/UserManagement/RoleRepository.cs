using BTO.Model.UserManagement;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.UserManagement
{
   public class RoleRepository
         : GenericRepository<Role>, IRoleRepository 
    {
       public RoleRepository(DbContext context)
            : base(context)
        {
           
        }
        public List<Role> GetAllRole()
        {
            return this.GetAll().ToList<Role>();
        }

        public Role GetById(int id)
        {
            return this.GetById(id);
        }

        public int Delete(int id)
        {   
            var parentId = new System.Data.SqlClient.SqlParameter("@parentId", id);
            return this._entities.Database.ExecuteSqlCommand("DeleteRoleById @parentId", parentId);
        }

        public int Update(Role role)
        {
            this.Edit(role);
            return this.SaveChange();
        }


        public Role AddRole(Role role)
        {
            this.Add(role);
            this.Save();
            return role;
        }

        public List<RoleDTO> GetRolesOfUsersInOrganizationUnit(string user_id, int organization_unit_id)
        {
            var para_user_id = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            var para_organization_unit_id = new System.Data.SqlClient.SqlParameter("@organization_unit_id", organization_unit_id);

            return this._entities.Database.SqlQuery<RoleDTO>("GetRolesOfUsersInOrganizationUnit @user_id, @organization_unit_id", para_user_id, para_organization_unit_id).ToList();
        }
    }
}
