using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model
{
    [Table("solutions")]
    public class Solution : Entity<int>
    {
        public System.Guid user_id { get; set; }
        public string name { get; set; }
        public string serialized_data { get; set; }
        public string type { get; set; }
        public Nullable<System.DateTime> time_create { get; set; }
        public int? version { get; set; }

        [NotMapped]
        public int number { get; set; }
    }
    public class SolutionModel
    {

        public int id { get; set; }
        public string name { get; set; }
        public string user_id { get; set; }
        public string type { get; set; }
        public DateTime time_create { get; set; }
        public Tracking.PersonalPlanModel currentPlan { get; set; }
    }
    public class SolutionObject
    {

        public int id { get; set; }
        public string name { get; set; }
        public string user_id { get; set; }
        public string type { get; set; }
        public DateTime time_create { get; set; }
        public PersonaPlan currentPlan { get; set; }

    }
}
