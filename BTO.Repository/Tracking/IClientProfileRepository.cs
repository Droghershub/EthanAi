using BTO.Model.Tracking;
using BTO.Models;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Tracking
{
    public interface IClientProfileRepository : IGenericRepository<ClientProfile>
    {
        IEnumerable<ClientProfile> getSessions(string user_id, int start, int number, string email);
        int getCountSessions(string user_id, int start, int number, string email);
        ClientProfile AddClientProfile(ClientProfile profile);
        ClientProfile GetById(int id);
        IEnumerable<ClientProfileModel> GetTrackingClientProfiles(DateTime startdate, DateTime enddate);
        IEnumerable<ClientProfileModel> GetTrackingClientProfilesByThread(DateTime startdate, DateTime enddate,int step,int paging);
    }
}
