using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using System.Xml.Serialization;
namespace BTO.Model
{
    [Table("persona")]
    public class Persona : Entity<int>
    {
        public Persona()
        {
            this.type = -1;
        }
        public Persona(Persona persona)
        {
            this.user_id = persona.user_id;
            this.variable = persona.variable;
            this.value = persona.value;
            this.type = persona.type== null?-1:(int)persona.type;
        }
        
        public System.Guid user_id { get; set; }
        public string variable { get; set; }
        public Nullable<decimal> value { get; set; }        
        public Nullable<int> type { get; set; } 
       
    }
}
