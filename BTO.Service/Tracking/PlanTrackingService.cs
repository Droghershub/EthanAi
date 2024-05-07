using BTO.Model.Tracking;
using BTO.Repository.Common;
using BTO.Repository.Tracking;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Tracking
{
    class PlanTrackingService : EntityService<PersonalPlanTracking>, IPlanTrackingService
    {
        IUnitOfWork _unitOfWork;
        IPersonaPlanTrackingRepository _personalPlanTrackingRepository;

        public PlanTrackingService(IUnitOfWork unitOfWork, IPersonaPlanTrackingRepository personalPlanTrackingRepository)
            : base(unitOfWork, personalPlanTrackingRepository)
        {
            _unitOfWork = unitOfWork;
            _personalPlanTrackingRepository = personalPlanTrackingRepository;
        } 

        public void Tracking(PersonalPlanTracking client)
        {
            _personalPlanTrackingRepository.Add(client);
            _personalPlanTrackingRepository.Save();
        }
    }
}
