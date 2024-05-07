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
    public class OrganizationUnitRoleRepository : GenericRepository<OrganizationUnitRole>, IOrganizationUnitRoleRepository
    {
        public OrganizationUnitRoleRepository(DbContext context)
            : base(context)
        {
           
        }
        public OrganizationUnitRole GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }

        public RolePermission GetByOrganizationUnitId(int id)
        {
            List<OrganizationUnitRole> organizationUnitRole = _entities.Set<OrganizationUnitRole>().Where(x => x.organization_unit_id == id).Include(y => y.role).ToList();
            return new RolePermission()
            {
                default_roles = organizationUnitRole.Where(x => x.role_status == 0).Select(x => x.role).ToList(),
                mandatory_roles = organizationUnitRole.Where(x => x.role_status == 1).Select(x => x.role).ToList(),
                allowable_roles = organizationUnitRole.Where(x => x.role_status == 2).Select(x => x.role).ToList()
            };
        }

        public void DeleteByOrganizationUnitIdAndStatus(int _organization_unit_id, int status)
        {
            Delete(x => x.organization_unit_id == _organization_unit_id && x.role_status == status);
            _entities.SaveChanges();
        }

        public bool DeleteOrganizationUnitRoleUser(int _organization_unit_id)
        {
            var para_organization_unit_id = new System.Data.SqlClient.SqlParameter("@organization_unit_id", _organization_unit_id);
            this._entities.Database.ExecuteSqlCommand("DeleteOrganizationUnitRoleUser @organization_unit_id", para_organization_unit_id);
            return true;
        }
    }
}
