using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Tracking
{
    [Table("tracking_user_session")]
    public class UserSession : Entity<int>
    {
        public int client_profile_id { get; set; }
        public string action_name { get; set; }
        public string action_description { get; set; }
        public string data { get; set; }
        public System.DateTime time_create { get; set; }
    }
    public class UserSessionModel
    {    
        public string action_name { get; set; }
        public string action_description { get; set; }        
        public object data { get; set; }
        public List<Persona> listPersona { get; set; }
        public UserProfileModel userProfile { get; set; }
        public object dataCalculate { get; set; }
        public double start_time { get; set; }
        public UserSessionModel(UserSession session)
        {
            action_name = session.action_name;
            action_description = session.action_description;
            start_time = 0;            
        }
    }
}
