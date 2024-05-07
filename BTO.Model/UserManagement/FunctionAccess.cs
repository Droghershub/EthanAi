using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.UserManagement
{

    [Table("um_functions")]
    public class FunctionAccess : Entity<int>
    {
        public FunctionAccess()
        {
            
        }

        public string name { get; set; }
        public string description { get; set; }
      
    }
    public class FunctionAccessModel
    {
        public FunctionAccessModel()
        {

        }
        public int id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public FunctionAction action { get; set; }

    }
}
