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
    [Table("UserClaims")]
    public class UserClaims : Entity<int>
    {
        public UserClaims()
        {
           
        }

        public string UserId { get; set; }
        public string ClaimType { get; set; }
        public string ClaimValue { get; set; }
        
    }
    public enum ClaimType
    {
        FORCE_RESET_PASSWORD=0
    }
}
