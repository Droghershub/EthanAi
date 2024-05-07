using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;

namespace BTO.Model.Rating
{
    [Table("user_rating")]
    public class UserRating : Entity<int>
    {
        public Guid user_id { get; set; }       
        public string sectionId { get; set; }
        public int rating { get; set; }
        public string feedback { get; set; }
        public bool contact_me { get; set; }
        public DateTime time_create { get; set; }
        public string serialized_data { get; set; }

    }
}
