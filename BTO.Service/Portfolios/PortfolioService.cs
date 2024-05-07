using BTO.Repository.Common;
using BTO.Repository.Payment;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Portfolios;
namespace BTO.Service.Portfolios
{
    public class PortfolioService : EntityService<BTO.Model.Portfolio.Portfolio>, IPortfolioService
    {
        IUnitOfWork _unitOfWork;
        IPortfolioRepository _portfolioRepository;

        public PortfolioService(IUnitOfWork unitOfWork, IPortfolioRepository portfolioRepository)
            : base(unitOfWork, portfolioRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._portfolioRepository = portfolioRepository;
        }


        public IList<BTO.Model.Portfolio.Portfolio> GetByUserId(Guid user_id)
        {
            return _portfolioRepository.FindBy(t=>t.portfolio_sheet.user_id == user_id).ToList();
        }

        public IList<BTO.Model.Portfolio.Portfolio> GetBySheetId(int id)
        {
            return _portfolioRepository.FindBy(t => t.portfolio_sheet_id == id).ToList();
        }
        
    }
}
