using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Profile
{
    public interface IUserRatingService : IEntityService<UserRating>
    {
        List<UserRating> GetUserRatingOfUser(Guid userId);
        UserRating PostUserRating(UserRating userRating);
    }
}
