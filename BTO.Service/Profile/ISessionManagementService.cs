using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Profile;
using BTO.Repository.Profile;
using BTO.Service.Common;

namespace BTO.Service.Profile
{
    public interface ISessionManagementService : IEntityService<SessionModel>
    {
        int RemoveSessionIdByUserId(Guid userId); 
        void AddSession(SessionModel session); 
        SessionModel GetSessionByUserId(Guid user_id);
    }
}
