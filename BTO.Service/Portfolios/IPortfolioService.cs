using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Portfolios
{
    public interface IPortfolioService : IEntityService<BTO.Model.Portfolio.Portfolio>
    {
        IList<BTO.Model.Portfolio.Portfolio> GetByUserId(Guid user_id);

        IList<BTO.Model.Portfolio.Portfolio> GetBySheetId(int id);
    }
}
