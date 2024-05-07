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
    [Table("user_profile_dependent")]
    public class UserProfileDependent : Entity<int>
    {
        public int user_profile_id { get; set; }
        public string full_name { get; set; }
        public int gender { get; set; }
        public int age { get; set; }
        public int? relationship { get; set; }
        public bool handicapped { get; set; }
        public bool independent { get; set; }
        public string avatar { get; set; }

        [NotMapped]
        public int min_age { get; set; }
        [NotMapped]
        public int max_age { get; set; }

        [ForeignKey("user_profile_id")]
        public virtual UserProfile user_profile { get; set; }
    }
}
