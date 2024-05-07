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
    [Table("sharing_connection")]
    public class Connection : Entity<int>
    {
        public Connection()
        {
            
        }
        public Guid connection_id { get; set; }
        public string email { get; set; }
        public System.DateTime time_online { get; set; }
    }
}
