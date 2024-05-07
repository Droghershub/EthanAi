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
    [Table("list_items")]
    public class ListItem : Entity<int>
    {
        public ListItem()
        {
            
        }
        public int parameter_id { get; set; }
        public string value { get; set; }
        public string name { get; set; }        
        
        [ForeignKey("parameter_id")]
        public Parameter parameter { get; set; }
    }
    public class ListItemModel
    {
        public ListItemModel()
        {

        }
        public int id { get; set; }
        public int parameter_id { get; set; }
        public string value { get; set; }
        public string name { get; set; }
        public string parameter_name { get; set; }
        
    }
}
