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
    public interface IUserProfileService : IEntityService<UserProfile>
    {
        UserProfile GetById(int Id);
        UserProfile GetByUserId(Guid Id);
        bool UpdateProfile(UserProfile _userProfile,UserProfile target);
        void UpdateExternalProfile(UserProfile userProfile);
        bool UpdateStartAge(UserProfile user, int startAge);
        void DeleteListDependent( List<UserProfileDependent> ids);
    }
}
