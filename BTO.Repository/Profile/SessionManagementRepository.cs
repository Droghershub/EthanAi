using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Profile;
using BTO.Repository.Profile;
using BTO.Repository.Common;
using System.Data.Entity;
namespace BTO.Repository.Profile
{
    public class SessionManagementRepository :  GenericRepository<SessionModel> ,ISessionManagementRepository
    {
        public SessionManagementRepository(DbContext context) : base(context)
        {

        }

        public int DeleteByUserId(Guid userId)
        {
            Delete(t => t.user_id == userId);
            return 1;
        }
    }
}
