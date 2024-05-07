using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;

namespace BTO.Service
{
    public class UserClaimsService : EntityService<UserClaims>, IUserClaimsService
    {
        IUnitOfWork _unitOfWork;
        IUserClaimsRepository _userClaimsRepository;

        public UserClaimsService(IUnitOfWork unitOfWork, IUserClaimsRepository aspNetUserClaimsRepository)
            : base(unitOfWork, aspNetUserClaimsRepository)
        {
            _unitOfWork = unitOfWork;
            _userClaimsRepository = aspNetUserClaimsRepository;
        }

        public UserClaims GetById(Guid Id)
        {
            return _userClaimsRepository.GetById(Id);
        }
        public UserClaims GetByClaimTypeAndUserId(string user_id, string claimType)
        {
            return _userClaimsRepository.GetByClaimTypeAndUserId(user_id, claimType);
        }
        public void DeleteByClaimTypeAndUserId(string user_id, string claimType)
        {
            _userClaimsRepository.DeleteByClaimTypeAndUserId(user_id, claimType);
        }
    }
}
