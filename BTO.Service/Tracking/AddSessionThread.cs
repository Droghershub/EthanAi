using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Tracking;
using BTO.Repository.Tracking;
namespace BTO.Service.Tracking
{
    public class AddSessionThread
    {
        private UserSession _session;
        private IUserSessionRepository _userSessionRepo;
        public AddSessionThread(UserSession session,IUserSessionRepository repo)
        {
            _session = session;
            _userSessionRepo = repo;
        }
        public void DoAdd()
        {
            _userSessionRepo.AddUserSessionByThread(_session);            
        }
    }
}
