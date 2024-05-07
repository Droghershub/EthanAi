using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Portfolio
{
    [Table("portfolio_sheets")]
    public class PortfolioSheet : Entity<int>
    {
        public Guid user_id { get; set; }
        public string name { get; set; }
        public virtual ICollection<Portfolio> portfolios { get; set; }
    }
}
