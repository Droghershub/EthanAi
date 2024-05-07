using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public class UserClaimsRepository : GenericRepository<UserClaims>, IUserClaimsRepository
    {
        public UserClaimsRepository(DbContext context)
            : base(context)
        {
           
        }
        public UserClaims GetById(Guid id)
        {
            return FindBy(x => x.UserId == id.ToString()).FirstOrDefault();            
        }
        public UserClaims GetByClaimTypeAndUserId(string user_id, string claimType)
        {
            return FindBy(x => x.UserId == user_id.ToString() && x.ClaimType == claimType).FirstOrDefault();
        }
        public void DeleteByClaimTypeAndUserId(string user_id, string claimType)
        {
            Delete(t => t.ClaimType == claimType && t.UserId == user_id);
            _entities.SaveChanges();
        }
    }
}
