using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public class OrganizationUnitRepository : GenericRepository<OrganizationUnit>, IOrganizationUnitRepository
    {
        public OrganizationUnitRepository(DbContext context)
            : base(context)
        {
           
        }
        public OrganizationUnit GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }

        public void DeleteTopParentId(int topParentId)
        {
            var parentId = new System.Data.SqlClient.SqlParameter("@parentId", topParentId);
            this._entities.Database.ExecuteSqlCommand("DeleteOrganizationUnit @parentId", parentId);
        }
    }
}
