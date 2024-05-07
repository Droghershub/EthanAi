using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;

namespace BTO.Model
{
    [Table("product_version")]
    public class ProductVersion : Entity<int>
    {
        public ProductVersion()
        {
            this.parameters = new HashSet<Parameter>();
        }
        public string name { get; set; }
        public string version { get; set; }     
        public bool is_default { get; set; }

        public ICollection<Parameter> parameters { get; set; }
    }
    public class ProductVersionMapping
    {
        public ProductVersionMapping()
        {
            
        }
        public string name { get; set; }
        public string version { get; set; }
        public int clone_from_id { get; set; }
        
    }
}
