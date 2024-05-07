using BTO.Model.Profile;
using BTO.Repository.Common;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Profile;

namespace BTO.Service.Profile
{
    public class ImageManagementService : EntityService<Image>,IImageManagementService
    {
        IUnitOfWork _unitOfWork;
        IImageManagementRepository _imagemManagementRepository;

        public ImageManagementService(IUnitOfWork unitOfWork, IImageManagementRepository _imagemManagementRepository)
            : base(unitOfWork, _imagemManagementRepository)
        {
            _unitOfWork = unitOfWork;
            this._imagemManagementRepository = _imagemManagementRepository;
        }

        public int Delete(int id)
        {
            return _imagemManagementRepository.DeleteImage(id);
        }

        public IList<Image> Get(Guid user_id)
        {
            return _imagemManagementRepository.Get(user_id);
        }
        public IList<Image> Get(Guid user_id, Model.Common.ImageType type, int dream_type_id)
        {
            return _imagemManagementRepository.Get(user_id, type, dream_type_id);
        }
        public int Update(Image image)
        {
            return _imagemManagementRepository.UpdateImage(image);
        }
         
        public Image Add(Image image)
        {
            return _imagemManagementRepository.AddImage(image);
        }

        public Image GetById(int id)
        {
            return _imagemManagementRepository.GetById(id);
        }
    }
}
