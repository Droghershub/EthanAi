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
    public interface IUserFeedbackService : IEntityService<UserFeedback>
    {
        List<UserFeedback> GetAllByUser(Guid userId);
        UserFeedback PostUserFeedback(UserFeedback userFeedback);
    }
}
