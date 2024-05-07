using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;


namespace BTO.Repository.Rating
{
    public interface IUserFeedbackRepository : IGenericRepository<UserFeedback>
    {
        List<UserFeedback> GetAll(Guid userId);
    }
}
