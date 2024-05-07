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
    [Table("news")]
    public class News : Entity<int>
    {
        public News()
        {
           
        }
        public Guid create_user_id { get; set; }
        public string news_content { get; set; }
        public string news_content_en { get; set; }
        public string news_content_fr { get; set; }
        public string news_content_ma { get; set; }
        public int opening_time_trigger { get; set; }
        public int no_activity_time_trigger { get; set; }
        public int prioritization { get; set; }
        public int sequencing { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime starting_date { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime expiration_date { get; set; }    

    }
}
