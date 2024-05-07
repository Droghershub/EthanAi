using BTO.Model.Tracking;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Tracking
{
    public interface IUserSessionRepository : IGenericRepository<UserSession>
    {
        IEnumerable<UserSession> GetByClientProfile(int client_profile_id);
        void AddUserSessionByThread(UserSession userSession);
    }
}
