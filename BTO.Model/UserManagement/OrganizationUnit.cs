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
    [Table("um_organization_unit")]
    public class OrganizationUnit : Entity<int>
    {
        public OrganizationUnit()
        {            
        }
        public int? parent_id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public int? product_version_id { get; set; }
        public string ui_version { get; set; }
    }
}
