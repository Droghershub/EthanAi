using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Product
{
    [Table("Product_Permissions")]
    public class ProductPermission : Entity<int>
    {
        public int Id { get; set; }
        public Nullable<int> Product_Version_id { get; set; }
        public Nullable<int> Product_Function_id { get; set; }
        public Nullable<int> Product_Permission_Type_id { get; set; }

        public virtual ProductFunction Product_Functions { get; set; }
        public virtual ProductPermissionType Product_Permission_Types { get; set; }
        public virtual ProductVersion Product_Versions { get; set; }
    }
}
