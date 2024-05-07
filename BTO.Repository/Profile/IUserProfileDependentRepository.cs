using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IUserProfileDependentRepository : IGenericRepository<UserProfileDependent>
    {
        UserProfileDependent GetById(int id);
    }
}
