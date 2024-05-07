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
    [Table("AspNetUsers")]
    public class AspNetUser : Entity<string>
    {
        public AspNetUser()
        {
           
        }
        
        public string Email { get; set; }
        public bool EmailConfirmed { get; set; }
        /*public string PasswordHash { get; set; }
        public string SecurityStamp { get; set; }
        public string PhoneNumber { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }*/
        public Nullable<System.DateTime> LockoutEndDateUtc { get; set; }
        public bool LockoutEnabled { get; set; }
        public int AccessFailedCount { get; set; }
        public string UserName { get; set; }
         
        //public bool IsLoginFacebook { get; set; }
        //public bool IsLoginGoogle { get; set; }
        //public bool IsLoginTwitter { get; set; }
        //public bool IsLoginLinkedIn { get; set; }

        //[NotMapped]
        //public bool IsCanLoginLocal { get; set; }
        public string DisableProviderList { get; set; }

        public bool? EmailConfirmedProvider { get; set; }

        [NotMapped]
        public int RowTotal { get; set; }

        [NotMapped]
        public bool isActive
        {
            get
            {
                if (LockoutEndDateUtc == null || DateTime.Compare(DateTime.Now, (DateTime)LockoutEndDateUtc) > 0)
                    return true;
                else
                    return false;
            }
            set
            {
                /*if (LockoutEndDateUtc == null || DateTime.Compare(DateTime.Now, (DateTime)LockoutEndDateUtc) > 0)
                    _isActive = true;
                else
                    _isActive = false;*/
            }
        }
    }
}
