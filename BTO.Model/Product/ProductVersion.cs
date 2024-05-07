using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Product
{
    [Table("Product_Versions")]
    public class ProductVersion : Entity<int>
    {
        public ProductVersion()
        {
            this.ProductPermissions = new HashSet<ProductPermission>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public Nullable<decimal> Price { get; set; }
        public Nullable<System.DateTime> CreateDate { get; set; }

        public virtual ICollection<ProductPermission> ProductPermissions { get; set; }
    }
}
