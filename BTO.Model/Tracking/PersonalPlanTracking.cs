using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Tracking
{
    [Table("tracking_personal_plans")]
    public class PersonalPlanTracking : Entity<int>
    {
        public Nullable<System.Guid> user_id { get; set; }
        public Nullable<int> level_track_id { get; set; }
        public string serialized_data { get; set; }
        public Nullable<System.DateTime> time_create { get; set; }
        public string action_type { get; set; }
        public string current_tab { get; set; }
        public string session_id { get; set; }
        public PersonalPlanTracking()
        {
            current_tab = "";
            session_id = "";
        }
    }
    
}
