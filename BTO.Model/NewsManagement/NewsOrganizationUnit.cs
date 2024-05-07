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
    [Table("news_organization_unit")]
    public class NewsOrganizationUnit : Entity<int>
    {
        public NewsOrganizationUnit()
        {
           
        }
        public int news_id { get; set; }
        public int organization_unit_id { get; set; }          

    }
}
