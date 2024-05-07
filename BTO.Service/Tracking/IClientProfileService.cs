using BTO.Model.Tracking;
using BTO.Models;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Tracking
{
    public interface  IClientProfileService : IEntityService<ClientProfile>
    {
        ClientProfile AddClientProfile(ClientProfile profile);
        IEnumerable<ClientProfile> getSessions(string user_id, int start, int number, string email);
        int getCountSessions(string user_id, int start, int number, string email);
        ClientProfile GetById(int id);
        IEnumerable<ClientProfileModel> GetTrackingClientProfiles(DateTime startdate, DateTime enddate);
        IEnumerable<ClientProfileModel> GetTrackingClientProfilesByThread(DateTime startdate, DateTime enddate, int step, int paging);
    }
}
