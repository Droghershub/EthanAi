using BTO.Repository.Common;
using BTO.Repository.Portfolios;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Portfolios
{
    public class PortfolioSheetService : EntityService<BTO.Model.Portfolio.PortfolioSheet>, IPortfolioSheetService
    {
        IUnitOfWork _unitOfWork;
        IPortfolioSheetRepository _portfolioSheetRepository;

        public PortfolioSheetService(IUnitOfWork unitOfWork, IPortfolioSheetRepository portfolioSheetRepository)
            : base(unitOfWork, portfolioSheetRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._portfolioSheetRepository = portfolioSheetRepository;
        }

        public IList<BTO.Model.Portfolio.PortfolioSheet> GetByUserId(Guid user_id){
            return _portfolioSheetRepository.FindBy(t => t.user_id == user_id).ToList();
        }

        public int DeleteById(Guid user_id, int id)
        {
            _portfolioSheetRepository.Delete(t => t.id == id && t.user_id == user_id);
            return _portfolioSheetRepository.SaveChange();
        }
        
    }
}
