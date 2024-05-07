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
    public class DreamTypeService : EntityService<DreamType>, IDreamTypeService
    {
        IUnitOfWork _unitOfWork;
        IDreamTypeRepository _dreamTypeRepository;

        public DreamTypeService(IUnitOfWork unitOfWork, IDreamTypeRepository dreamTypeRepository)
            : base(unitOfWork, dreamTypeRepository)
        {
            _unitOfWork = unitOfWork;
            _dreamTypeRepository = dreamTypeRepository;
        }


        public DreamType GetById(int Id)
        {
            return _dreamTypeRepository.GetById(Id);
        }

        public List<DreamType> GetAllData()
        {
            return _dreamTypeRepository.GetAllData();
        }
    }
}
