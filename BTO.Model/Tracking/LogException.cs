using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Tracking
{
    [Table("log_exceptions")]
    public class LogException : Entity<int>
    {
        public System.Guid user_id { get; set; }
        public Nullable<int> level_track_id { get; set; }
        public string Type { get; set; }
        public string message { get; set; }
        public Nullable<System.DateTime> time_create { get; set; }
    }
}
