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
    [Table("news_user")]
    public class NewsUser : Entity<int>
    {
        public NewsUser()
        {
           
        }
        public int news_id { get; set; }
        public string user_id { get; set; }          

    }
}
