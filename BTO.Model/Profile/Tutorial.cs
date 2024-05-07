using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Profile
{
    [Table("tutorials")]
    public class Tutorial : Entity<int>
    {
        public string keyid { get; set; }
        public string content { get; set; }
        public string title { get; set; }
        
    }
}
