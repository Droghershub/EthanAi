using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Product
{
    [Table("Product_Functions")]
    public class ProductFunction : Entity<int>
    {
        public ProductFunction()
        {
            this.ProductPermissions = new HashSet<ProductPermission>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public string KeyCode { get; set; }
        public Nullable<bool> IsActive { get; set; }
        public Nullable<System.DateTime> CreateDate { get; set; }

        public virtual ICollection<ProductPermission> ProductPermissions { get; set; }
    }
}
