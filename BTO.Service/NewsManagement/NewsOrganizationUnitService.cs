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
    public class NewsOrganizationUnitService : EntityService<NewsOrganizationUnit>, INewsOrganizationUnitService
    {
        IUnitOfWork _unitOfWork;
        INewsOrganizationUnitRepository _newsOrganizationUnitRepository;

        public NewsOrganizationUnitService(IUnitOfWork unitOfWork, INewsOrganizationUnitRepository _newsOrganizationUnitRepository)
            : base(unitOfWork, _newsOrganizationUnitRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._newsOrganizationUnitRepository = _newsOrganizationUnitRepository;
        }

        public NewsOrganizationUnit GetById(int Id)
        {
            return _newsOrganizationUnitRepository.GetById(Id);
        }

        public NewsOrganizationUnit GetByNewIdAndOrganizationUnitId(int newsId, int organization_unit_id)
        {
            return _newsOrganizationUnitRepository.FindBy(x => x.news_id == newsId && x.organization_unit_id == organization_unit_id).SingleOrDefault();
        }
    }
}
