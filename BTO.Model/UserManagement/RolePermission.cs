using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model
{
    public class RolePermission
    {
        public object default_roles { get; set; }
        public object mandatory_roles { get; set; }
        public object allowable_roles { get; set; }
        public object themes { get; set; }
    }
}