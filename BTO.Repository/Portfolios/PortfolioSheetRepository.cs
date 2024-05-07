using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Portfolios
{
    public class PortfolioSheetRepository : GenericRepository<BTO.Model.Portfolio.PortfolioSheet>, IPortfolioSheetRepository
    {
        public PortfolioSheetRepository(DbContext context)
            : base(context)
        {

        } 
    }
}
