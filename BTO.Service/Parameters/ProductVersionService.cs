using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;

namespace BTO.Service
{
    public class ProductVersionService : EntityService<ProductVersion>, IProductVersionService
    {
        IUnitOfWork _unitOfWork;
        IProductVersionRepository _productVersionRepository;

        public ProductVersionService(IUnitOfWork unitOfWork, IProductVersionRepository productVersionRepository)
            : base(unitOfWork, productVersionRepository)
        {
            _unitOfWork = unitOfWork;
            _productVersionRepository = productVersionRepository;
        }


        public ProductVersion GetById(int Id)
        {
            return _productVersionRepository.GetById(Id);
        }

        public ProductVersion CloneProductVersion(ProductVersionMapping cloneVersion)
        {
            return _productVersionRepository.CloneProductVersion(cloneVersion);
        }
        public ProductVersion GetByUserId(string user_id)
        {
            return _productVersionRepository.GetByUserId(user_id);
        }
    }
}
