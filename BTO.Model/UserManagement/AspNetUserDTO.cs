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
    public class AspNetUserDTO 
    {
        public AspNetUserDTO()
        {
           
        }
        public int OrganizationUserId { get; set; }
        public string Id { get; set; }
        public string Email { get; set; }
       
        public int RowTotal { get; set; }

        public Nullable<System.DateTime> LockoutEndDateUtc { get; set; }
        public bool LockoutEnabled { get; set; }
        public int AccessFailedCount { get; set; }

        public string OrganizationUnitName { get; set; }

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
        }
    }
}
