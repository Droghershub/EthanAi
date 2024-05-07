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
    [Table("parameters")]
    public class Parameter : Entity<int>
    {
        public Parameter()
        {
            this.listItems = new HashSet<ListItem>();
        }
        public int product_version_id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public int type { get; set; }
        public string format_number { get; set; }   
        public string default_value { get; set; }      
        public decimal? min_value { get; set; }
        public decimal? max_value { get; set; }
        public string method { get; set; }
        public int? parent_id { get; set; }
        public bool editable { get; set; }

        public bool? deleteable { get; set; }
        public bool? isSummable { get; set; }
        public bool? is_formula { get; set; }
        public bool? is_choose_formula { get; set; }

        [NotMapped]
        public List<Parameter> nodes { get; set; }

        public ICollection<ListItem> listItems { get; set; }

        [ForeignKey("product_version_id")]
        public ProductVersion productVersion { get; set; }
    }
}
