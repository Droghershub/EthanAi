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
    public class UserProfileService : EntityService<UserProfile>, IUserProfileService
    {
        IUnitOfWork _unitOfWork;
        IUserProfileRepository _userProfileRepository;

        public UserProfileService(IUnitOfWork unitOfWork, IUserProfileRepository userProfileRepository)
            : base(unitOfWork, userProfileRepository)
        {
            _unitOfWork = unitOfWork;
            _userProfileRepository = userProfileRepository;
        }


        public UserProfile GetById(int Id)
        {
            return _userProfileRepository.GetById(Id);
        }

        public UserProfile GetByUserId(Guid Id)
        {
            return _userProfileRepository.GetByUserLoginId(Id);
        }

        public bool UpdateProfile(UserProfile _userProfile, UserProfile target)
        {
            try
            {
                target = this.CopyProfile(_userProfile, target);                
                _userProfileRepository.Save();
            }
            catch (Exception ex)
            {
                return false;
            }
            return true;
        }
        public void UpdateExternalProfile(UserProfile userProfile)
        {
            _userProfileRepository.UpdateExternalProfile(userProfile);
        }

        public bool UpdateStartAge(UserProfile user, int startAge)
        {
            return _userProfileRepository.UpdateStartAge(user,startAge);
        }
        public void DeleteListDependent(List<UserProfileDependent> ids)
        {
            _userProfileRepository.DeleteListDependent(ids);
        }
        private UserProfile CopyProfile(UserProfile source, UserProfile target)
        {
            target.first_name = source.first_name;
            target.last_name = source.last_name;
            target.email = source.email;
            target.phone_code = source.phone_code;
            target.phone_number = source.phone_number;
            target.gender = source.gender;
            target.age = source.age;
            target.residency_status = source.residency_status;
            target.nationality = source.nationality;
            target.married_status = source.married_status;
            target.spouse_first_name = source.spouse_first_name;
            target.spouse_last_name = source.spouse_last_name;
            target.spouse_gender = source.spouse_gender;
            target.spouse_age = source.spouse_age;
            target.spouse_residency_status = source.spouse_residency_status;
            target.spouse_nationality = source.spouse_nationality;
            target.occupation = source.occupation;
            target.spouse_occupation = source.spouse_occupation;
            target.location = source.location;
            target.isChanged = source.isChanged;
            target.avatar = source.avatar;
            target.spouse_avatar = source.spouse_avatar;
            foreach (UserProfileDependent dependent in source.dependent)
            {
                if (dependent.id <= 0)
                {
                    target.dependent.Add(dependent);                    
                }
                else
                {
                    UserProfileDependent depend = target.dependent.Where(x=>x.id == dependent.id).FirstOrDefault();
                    if (depend != null)
                    {                       
                        depend.full_name = dependent.full_name;
                        depend.gender = dependent.gender;
                        depend.age = dependent.age;
                        depend.relationship = dependent.relationship;
                        depend.handicapped = dependent.handicapped;
                        depend.independent = dependent.independent;
                     //   depend.avatar = dependent.avatar;
                    }
                }   

            }
            return target;
        }
    }
}
