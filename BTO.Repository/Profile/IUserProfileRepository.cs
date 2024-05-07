using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
namespace BTO.Repository
{
    public interface IUserProfileRepository : IGenericRepository<UserProfile>
    {
        UserProfile GetById(int id);
        UserProfile GetByUserLoginId(Guid id);
        void DeleteUserLoginId(Guid id);
        void UpdateExternalProfile(UserProfile userProfile);

        bool UpdateStartAge(UserProfile user, int startAge);
        void DeleteListDependent(List<UserProfileDependent> ids);
    }
}
