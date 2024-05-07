using BTO.Model;
using BTO.Model.Tracking;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Tracking
{
    public interface IUserSessionService : IEntityService<UserSession>
    {
        void AddUserSession(UserSession userSession);
        void AddUserSession(int client_id, BTO.Common.WebAction.Action action, string data);
        List<UserSessionModel> GetByClientProfile(int client_profile_id,string version);
        UserSessionModel GetSessionModel(UserSession session, BTO.Common.WebAction.Action action,bool isUseTab,string version);
        void UpdateProperty(PersonaPlan personaPlan, List<TrackPropertyChange> listChange);
        void UpdateDream(PersonaPlan personaPlan, TrackObjectChange obj);
        void UpdateLifeEvent(PersonaPlan personaPlan, TrackObjectChange obj);
        void UpdateRankingIndex(PersonaPlan personaPlan,List<BTO.Model.Tracking.RankingDreams> list);
    }
}
