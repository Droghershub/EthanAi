using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Rating
{
    public class UserFeedbackRepository : GenericRepository<UserFeedback>, IUserFeedbackRepository
    {
        public UserFeedbackRepository(DbContext context)
            : base(context)
        {

        }

        public List<UserFeedback> GetAll(Guid userId)
        {
            return _dbset.Where(x => x.user_id == userId).ToList();
        }
    }
}
