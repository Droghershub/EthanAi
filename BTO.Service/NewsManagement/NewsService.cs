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
    public class NewsService : EntityService<News>, INewsService
    {
        IUnitOfWork _unitOfWork;
        INewsRepository _newsRepository;

        public NewsService(IUnitOfWork unitOfWork, INewsRepository _newsRepository)
            : base(unitOfWork, _newsRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._newsRepository = _newsRepository;
        }

        public News GetById(int Id)
        {
            return _newsRepository.GetById(Id);
        }

        public List<News> GetNewsByUserId(string user_id)
        {
            return _newsRepository.GetNewsByUserId(user_id);
        }

    }
}
