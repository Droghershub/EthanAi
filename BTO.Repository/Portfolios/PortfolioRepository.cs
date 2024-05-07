using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Portfolios
{
    public class PortfolioRepository : GenericRepository<BTO.Model.Portfolio.Portfolio>, IPortfolioRepository
    {
        public PortfolioRepository(DbContext context)
            : base(context)
        {

        }
    }
}
