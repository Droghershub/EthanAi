using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.UserManagement
{   
    public class RoleDTO
    {
        public RoleDTO()
        {
            
        }
        public int id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public int?  parent_id { get; set; }
        public int role_type { get; set; }
        public int action_type { get; set; }

    }
}
