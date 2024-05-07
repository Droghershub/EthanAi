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
    [Table("dream_type_config")]
    public class DreamTypeConfig : Entity<int>
    {
        public int dream_type_id { get; set; }

        public string field_name { get; set; }
        public bool display { get; set; }
        public string description { get; set; }
        public string description_existant { get; set; }
        public string default_value { get; set; }
        public string datatype { get; set; }

        public bool user_edit { get; set; }
        public Nullable<int> order { get; set; }
        
        [ForeignKey("dream_type_id")]
        public virtual DreamType dreamType { get; set; }
    }
}
