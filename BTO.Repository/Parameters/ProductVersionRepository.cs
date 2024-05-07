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
    public class ProductVersionRepository : GenericRepository<ProductVersion>, IProductVersionRepository
    {
        public ProductVersionRepository(DbContext context)
            : base(context)
        {
           
        }
        public ProductVersion GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
        public ProductVersion CloneProductVersion(ProductVersionMapping cloneVersion)
        {
            var nameparam = new System.Data.SqlClient.SqlParameter("@name", cloneVersion.name);
            var versionparam = new System.Data.SqlClient.SqlParameter("@version", cloneVersion.version);
            var clonidparam = new System.Data.SqlClient.SqlParameter("@clone_from_id", cloneVersion.clone_from_id);
            return _entities.Database.SqlQuery<ProductVersion>("CloneProductVersion @name, @version, @clone_from_id", nameparam, versionparam, clonidparam).FirstOrDefault();
            
        }
        public ProductVersion GetByUserId(string user_id)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            return _entities.Database.SqlQuery<ProductVersion>("GetProductVersionForUser @user_id", userparam).FirstOrDefault();            
        }
    }
}
