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
    [Table("sharing_group")]
    public class Group : Entity<int>
    {
        public Group()
        {
            this.members = new HashSet<Member>();
        }        
        public string owner { get; set; }
        public string owner_takeover { get; set; }
        public System.DateTime time_create { get; set; }
        public bool status { get; set; }
        public bool processing { get; set; }
        public virtual ICollection<Member> members { get; set; }
    }
}
