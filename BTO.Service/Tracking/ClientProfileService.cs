using BTO.Model.Tracking;
using BTO.Models;
using BTO.Repository;
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
    public class ClientProfileService : EntityService<ClientProfile>, IClientProfileService
    {
        IUnitOfWork _unitOfWork;
        IClientProfileRepository _clientProfileRepository;

        public ClientProfileService(IUnitOfWork unitOfWork, IClientProfileRepository clientProfileRepository)
            : base(unitOfWork, clientProfileRepository)
        {
            _unitOfWork = unitOfWork;
            _clientProfileRepository = clientProfileRepository;
        } 
        public ClientProfile AddClientProfile(ClientProfile profile)
        {
            return _clientProfileRepository.AddClientProfile(profile);
        }

        public IEnumerable<ClientProfile> getSessions(string user_id, int start, int number, string email)
        {
            return _clientProfileRepository.getSessions(user_id,start, number, email);
        }

        public int getCountSessions(string user_id, int start, int number, string email) {
            return _clientProfileRepository.getCountSessions(user_id, start, number, email);
        }

        public ClientProfile GetById(int id)
        {
            return _clientProfileRepository.GetById(id);
        }

        public IEnumerable<ClientProfileModel> GetTrackingClientProfiles(DateTime startdate, DateTime enddate)
        {
             IEnumerable<ClientProfileModel> data = _clientProfileRepository.GetTrackingClientProfiles(startdate, enddate);
             return data;   
        }
        public IEnumerable<ClientProfileModel> GetTrackingClientProfilesByThread(DateTime startdate, DateTime enddate,int step,int paging)
        {
            IEnumerable<ClientProfileModel> data = _clientProfileRepository.GetTrackingClientProfilesByThread(startdate, enddate,step,paging);                                    
            return data;
        }
    }
}
