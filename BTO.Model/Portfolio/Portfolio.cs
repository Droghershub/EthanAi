using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Portfolio
{
    [Table("portfolios")]
    public class Portfolio : Entity<int>
    {
        //public int id { get; set; }
        //public Guid user_id { get; set; }
        public int portfolio_sheet_id { get; set; }
        public string stock { get; set; }
        public string symbol { get; set; }
        public string isin { get; set; }
        public string cusip { get; set; }
        public string exch { get; set; }
        public string exch_detail { get; set; }
        public string ccy { get; set; }
        public Decimal price { get; set; }
        public Decimal quantity { get; set; }
        public Decimal position { get; set; }
        public string date_time { get; set; }
        public string asset_class { get; set; }
        public string oportfolio_stategy { get; set; }

        [ForeignKey("portfolio_sheet_id")]
        public PortfolioSheet portfolio_sheet { get; set; }
    }
}
