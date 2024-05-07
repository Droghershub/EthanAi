using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Service.Common;
using BTO.Model.Profile;
using BTO.Repository.Profile;
using BTO.Repository.Common;

namespace BTO.Service.Profile
{
    public class SessionManagementService : EntityService<SessionModel>, ISessionManagementService
    {

        IUnitOfWork _unitOfWork;
        ISessionManagementRepository _sessionMangementRepository;

        public SessionManagementService(IUnitOfWork unitOfWork, ISessionManagementRepository _sessionMangementRepository)
            : base(unitOfWork, _sessionMangementRepository)
        {
            _unitOfWork = unitOfWork;
            this._sessionMangementRepository = _sessionMangementRepository;
        }


        public int RemoveSessionIdByUserId(Guid userId)
        {
            return this._sessionMangementRepository.DeleteByUserId(userId);
        }


        public void AddSession(SessionModel session)
        { 
            this._sessionMangementRepository.Add(session);
            this._sessionMangementRepository.Save();
        }


        public SessionModel GetSessionByUserId(Guid user_id)
        {
            return this._sessionMangementRepository.FindBy(t => t.user_id == user_id).FirstOrDefault<SessionModel>();
        }
    }
}
