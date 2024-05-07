using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Portfolios
{
    public interface IPortfolioSheetService : IEntityService<BTO.Model.Portfolio.PortfolioSheet>
    {
        IList<BTO.Model.Portfolio.PortfolioSheet> GetByUserId(Guid user_id);

        int DeleteById(Guid user_id, int id);
    }
}
