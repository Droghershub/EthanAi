using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.UserManagement
{

    [Table("um_function_role")]
    public class FunctionAccessRole : Entity<int>
    {
        public FunctionAccessRole()
        {
            
        }
        public FunctionAction action { get; set; }
        [NotMapped]
        public int action_id
        {
            get { return (int)action; }
            set { action = (FunctionAction)value; }
        }
        public int function_id { get; set; }
        public int role_id { get; set; }        
        [ForeignKey("function_id")]
        public virtual FunctionAccess FunctionAccess { get; set; }        
        [ForeignKey("role_id")]
        public virtual Role Role { get; set; }
        
      
    }
    public class FunctionAccessRoleModel
    {
        public FunctionAccessRoleModel()
        {

        }
        public int role_id { get; set; }
        public List<FunctionAccessModel> functions { get; set; }
        public List<FunctionAccessRole> ParseToDbModel()
        {
            List<FunctionAccessRole> results = new List<FunctionAccessRole>();
            foreach (FunctionAccessModel model in functions)
            {
                results.Add(new FunctionAccessRole()
                {
                    id = model.id,
                    action = model.action,                    
                    function_id = model.id,
                    role_id = this.role_id
                });
            }
            return results;
        }
    }
}
