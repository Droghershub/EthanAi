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
    [Table("payment")]
    public class Payment : Entity<int>
    {
        public decimal amount { get; set; }
        public string currency_code { get; set; }
        public string transaction_id { get; set; }
        public DateTime payment_date { get; set; }
        public Guid user_id { get; set; }

        public string subcription_type { get; set; }
        public DateTime begin_date { get; set; }
        public DateTime end_date { get; set; }

    }
}
