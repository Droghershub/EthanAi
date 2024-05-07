using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Tracking
{
    [Table("tracking_client_profiles")]
    public class ClientProfile : Entity<int>
    {
        public System.Guid user_id { get; set; }
        public Nullable<int> level_track_id { get; set; }
        public string serialized_data { get; set; }
        public Nullable<System.DateTime> time_create { get; set; }
        public Nullable<System.DateTime> time_update { get; set; }
        public string email { get; set; }
        public string ui_version { get; set; }
        [NotMapped]
        public string duration 
        { 
            get 
            {
                TimeSpan time = (TimeSpan)(time_update - time_create);
                return String.Format("{0:00}:{1:00}:{2:00}",time.Hours,time.Minutes,time.Seconds); 
            } 
        }
    }
}
