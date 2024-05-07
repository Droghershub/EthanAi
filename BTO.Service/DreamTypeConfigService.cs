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
    public class DreamTypeConfigService : EntityService<DreamTypeConfig>, IDreamTypeConfigService
    {
        IUnitOfWork _unitOfWork;
        IDreamTypeConfigRepository _dreamTypeConfigRepository;

        public DreamTypeConfigService(IUnitOfWork unitOfWork, IDreamTypeConfigRepository dreamTypeConfigRepository)
            : base(unitOfWork, dreamTypeConfigRepository)
        {
            _unitOfWork = unitOfWork;
            _dreamTypeConfigRepository = dreamTypeConfigRepository;
        }


        public DreamTypeConfig GetById(int Id)
        {
            return _dreamTypeConfigRepository.GetById(Id);
        }

        public List<DreamTypeConfig> GetAllData()
        {
            return _dreamTypeConfigRepository.GetAllData();
        }
        public List<DreamTypeConfig> GetByDreamTypeId(int dreamType_id)
        {
            return _dreamTypeConfigRepository.GetByDreamTypeId(dreamType_id);
        }
    }
}
