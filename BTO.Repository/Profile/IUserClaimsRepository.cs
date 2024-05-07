using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IUserClaimsRepository : IGenericRepository<UserClaims>
    {
        UserClaims GetById(Guid id);
        UserClaims GetByClaimTypeAndUserId(string user_id, string claimType);
        void DeleteByClaimTypeAndUserId(string user_id, string claimType);
    }
}
