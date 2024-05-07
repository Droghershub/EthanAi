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
    [Table("dream_type")]
    public class DreamType : Entity<int>
    {
        /*public DreamType()
        {
            this.dreams = new HashSet<Dream>();
        }*/
        public string dream_name { get; set; }
        public string image_name { get; set; }

        public Nullable<bool> is_liquid { get; set; }

        public string type { get; set; }
        public ICollection<DreamTypeConfig> dreamTypeConfig { get; set; }
    }
}
