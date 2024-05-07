using BTO.Model.Profile;
using BTO.Repository.Common;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Profile;
using BTO.Model.Rating;
using BTO.Repository.Rating;
using BTO.Model;
using BTO.Repository.NewsManagement;
namespace BTO.Service
{
    public class NewsUserService : EntityService<NewsUser>, INewsUserService
    {
        IUnitOfWork _unitOfWork;
        INewsUserRepository _newsUserRepository;

        public NewsUserService(IUnitOfWork unitOfWork, INewsUserRepository _newsUserRepository)
            : base(unitOfWork, _newsUserRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._newsUserRepository = _newsUserRepository;
        }

        public NewsUser GetById(int Id)
        {
            return _newsUserRepository.GetById(Id);
        }

        public NewsUser GetByNewIdAndUserId(int newsId, string user_id)
        {
            return _newsUserRepository.FindBy(x => x.news_id == newsId && x.user_id == user_id).SingleOrDefault();
        }
    }
}
