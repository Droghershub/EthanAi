using BTO.Model.History;
using BTO.Repository.Common;
using BTO.Repository.History;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.HistorySerives
{
    public class PersonalPlanHistoryService : EntityService<PersonalPlanHistory>, IPersonalPlanHistorySevice
    {
        IUnitOfWork _unitOfWork;
        IPersonalPlanHistoryRepository _personalPlanHistoryRepository;

        public PersonalPlanHistoryService(IUnitOfWork unitOfWork, IPersonalPlanHistoryRepository personalPlanHistoryRepository)
            : base(unitOfWork, personalPlanHistoryRepository)
        {
            _unitOfWork = unitOfWork;
            _personalPlanHistoryRepository = personalPlanHistoryRepository;
        }
        public override void Create(PersonalPlanHistory entity)
        {
            _personalPlanHistoryRepository.Attached(entity);
            _personalPlanHistoryRepository.Save(); 
        }
    }
}
