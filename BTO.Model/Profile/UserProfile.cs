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
    [Table("user_profile")]
    public class UserProfile : Entity<int>
    {
        public UserProfile()
        {
            this.dependent = new HashSet<UserProfileDependent>();
        }
        public Guid user_login_id { get; set; }
        public string first_name { get; set; }

        public string last_name { get; set; }
        public string email { get; set; }
        public string phone_code { get; set; }
        public string phone_number { get; set; }
        public int gender { get; set; }
        public int age { get; set; }
        public int residency_status { get; set; }
        public string nationality { get; set; }
        public int married_status { get; set; }
        public string spouse_first_name { get; set; }
        public string spouse_last_name { get; set; }
        public int spouse_gender { get; set; }
        public int spouse_age { get; set; }
        public int spouse_residency_status { get; set; }
        public string spouse_nationality { get; set; }
        public int occupation { get; set; }
        public int spouse_occupation { get; set; }
        
        public string location { get; set; }
        [NotMapped]
        public string typeplan { get; set; }
        [NotMapped]
        public int persona_plan_id { get; set; }
        
        public virtual ICollection<UserProfileDependent> dependent { get; set; }

        public string avatar { get; set; }
        
        public string spouse_avatar { get; set; }

        public bool isChangedStartAge { get; set; }

        public bool isChanged { get; set; }
        public bool viewed_tutorial { get; set; }
        public bool is_auto_register { get; set; }
    }
}
