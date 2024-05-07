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
    [Table("um_organization_unit_role")]
    public class OrganizationUnitRole : Entity<int>
    {
        public OrganizationUnitRole()
        {            
        }
        public int organization_unit_id { get; set; }
        public int role_id { get; set; }
        public int role_status { get; set; }

        [ForeignKey("organization_unit_id")]
        public OrganizationUnit organizationUnit { get; set; }

        [ForeignKey("role_id")]
        public Role role { get; set; }
    }
}
