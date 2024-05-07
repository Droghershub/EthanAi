using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;

namespace BTO.Model.Profile
{
    [Table("user_tutorial")]
    public class UserTutorial : Entity<int>
    {
        public Guid user_login_id { get; set; }
        public string keyid { get; set; }
        public bool is_show_tutorial { get; set; }
    }
}
