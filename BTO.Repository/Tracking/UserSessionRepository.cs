using BTO.Model.Tracking;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
namespace BTO.Repository.Tracking
{
    public class UserSessionRepository : GenericRepository<UserSession>, IUserSessionRepository
    {
        public UserSessionRepository(DbContext context)
            : base(context)
        {

        }
        public IEnumerable<UserSession> GetByClientProfile(int client_profile_id)
        {
            return FindBy(x => x.client_profile_id == client_profile_id);
        }
        public void AddUserSessionByThread(UserSession userSession)
        {
            using (BTOContext ctx = new BTOContext())
            {
                ctx.UserSession.Add(userSession);
                ctx.SaveChanges();
            }
        }
    }
}
