using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model.UserManagement;

namespace BTO.Model
{
    [Table("um_organization_user")]
    public class OrganizationUnitUser : Entity<int>
    {
        public OrganizationUnitUser()
        {            
        }
        public string user_id { get; set; }
        public int organization_unit_id { get; set; }
        public int? role_id { get; set; }
        public int? status { get; set; }

        [ForeignKey("organization_unit_id")]
        public OrganizationUnit organizationUnit { get; set; }

        [ForeignKey("role_id")]
        public Role role { get; set; }

        [ForeignKey("user_id")]
        public AspNetUser aspNetUser { get; set; }
    }
}
