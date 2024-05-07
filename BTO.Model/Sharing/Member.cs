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
    [Table("sharing_member")]
    public class Member : Entity<int>
    {
        public Member()
        {
            
        }        
        public int group_id { get; set; }
        public string member { get; set; }        
        public bool accepted { get; set; }

        [ForeignKey("group_id")]
        public virtual Group group { get; set; }
    }
}
