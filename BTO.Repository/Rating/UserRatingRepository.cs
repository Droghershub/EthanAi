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
    public class UserRatingRepository : GenericRepository<UserRating>, IUserRatingRepository
    {
        public UserRatingRepository(DbContext context)
            : base(context)
        {

        }

        public List<UserRating> GetAll(Guid userId)
        {
            return _dbset.Where(x => x.user_id == userId).GroupBy(x => new { x.user_id, x.sectionId }, (key, g) => g.OrderByDescending(e => e.time_create).FirstOrDefault()).ToList();
        }
    }
}
