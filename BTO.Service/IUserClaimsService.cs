using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface IUserClaimsService : IEntityService<UserClaims>
    {
        UserClaims GetById(Guid Id);
        UserClaims GetByClaimTypeAndUserId(string user_id, string claimType);
        void DeleteByClaimTypeAndUserId(string user_id, string claimType);
    }
}
