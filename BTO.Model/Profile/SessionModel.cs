using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Profile
{
    [Table("session_management")]
    public class SessionModel : Entity<int>
    {
        public string session_id { get; set; }
        public Guid user_id { get; set; }
        public DateTime time_solution_updated { get; set; }
        public string user_agent { get; set; }
        public string ip { get; set; }
        public DateTime time_login { get; set; }
        public DateTime time_create { get; set; }
    }
}
