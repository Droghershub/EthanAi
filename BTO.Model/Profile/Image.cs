using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Profile
{
    [Table("images")]
    public class Image : Entity<int>
    {
        public Guid user_id { get; set; }
        public string url { get; set; }
        public ImageType type { get; set;}
        public int? dream_type_id { get; set; }       
    }
}
