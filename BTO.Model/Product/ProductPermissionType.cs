using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Product
{
    [Table("Product_Permission_Types")]
    public class ProductPermissionType : Entity<int>
    {
        public ProductPermissionType()
        {
            this.ProductPermissions = new HashSet<ProductPermission>();
        }
    
        public int Id { get; set; }
        public string NameDisplay { get; set; }
        public string NameCode { get; set; }
        public Nullable<int> OrderPermission { get; set; }

        public virtual ICollection<ProductPermission> ProductPermissions { get; set; }
    }
}
