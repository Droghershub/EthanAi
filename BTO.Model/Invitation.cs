using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using System.Xml.Serialization;
namespace BTO.Model
{
    [Table("invitation")]
    public class Invitation : Entity<int>
    {
        public Invitation()
        {
            
        }       
        public System.Guid user_id { get; set; }
        public string email { get; set; }
        public string name { get; set; }
        public string ip { get; set; }
        public DateTime date_created { get; set; }
        public bool is_sent { get; set; }

    }
    public class InvitationModel
    {
        public string UserEmail { get; set; }
        public Guid UserId { get; set; }
        public string IP { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }        
        public DateTime DateTime { get; set; }
    }
}
