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
    public class UserProfileRepository : GenericRepository<UserProfile>, IUserProfileRepository
    {
        public UserProfileRepository(DbContext context)
            : base(context)
        {
           
        }
        public UserProfile GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }


        public UserProfile GetByUserLoginId(Guid id)
        {
            return FindBy(x => x.user_login_id == id).FirstOrDefault();
        }
                
        public void DeleteUserLoginId(Guid id)
        {
            Delete(x => x.user_login_id == id);            
        }
        public void UpdateExternalProfile(UserProfile userProfile)
        {
            var emailPara = new System.Data.SqlClient.SqlParameter("@email", System.Data.SqlDbType.NVarChar,50);
            emailPara.Value = userProfile.email;
            var firstnamePara = new System.Data.SqlClient.SqlParameter("@first_name", System.Data.SqlDbType.NVarChar,100);
            firstnamePara.Value = String.IsNullOrEmpty(userProfile.first_name) ? "" : userProfile.first_name;
            var lastnamePara = new System.Data.SqlClient.SqlParameter("@last_name", System.Data.SqlDbType.NVarChar, 100);
            lastnamePara.Value = String.IsNullOrEmpty(userProfile.last_name) ? "" : userProfile.last_name;
            var locationPara = new System.Data.SqlClient.SqlParameter("@location", System.Data.SqlDbType.NVarChar, 255);
            locationPara.Value = String.IsNullOrEmpty(userProfile.location) ? "" : userProfile.location;
            
            var genderPara = new System.Data.SqlClient.SqlParameter("@gender", System.Data.SqlDbType.Int, 2);
            genderPara.Value = Int16.Equals(userProfile.gender, null) ? -1 : userProfile.gender;
            
            var avatarPara = new System.Data.SqlClient.SqlParameter("@avatar", System.Data.SqlDbType.NVarChar, 500); 
            avatarPara.Value = String.IsNullOrEmpty(userProfile.avatar) ? "": userProfile.avatar;

            this._entities.Database.SqlQuery<int>("UpdateExternalProfile @email, @first_name, @last_name, @location, @gender, @avatar", emailPara, firstnamePara, lastnamePara, locationPara, genderPara, avatarPara).FirstOrDefault();  
        }
         
        public bool UpdateStartAge(UserProfile user, int startAge)
        {
            var userId = new System.Data.SqlClient.SqlParameter("@user_id", System.Data.SqlDbType.UniqueIdentifier);
            userId.Value = user.user_login_id;
            var startAgeParam = new System.Data.SqlClient.SqlParameter("@startage", System.Data.SqlDbType.Int);
            startAgeParam.Value = startAge;
            var obj = this._entities.Database.ExecuteSqlCommand("UpdateStartAge @user_id, @startage", userId, startAgeParam);
            return obj > 0 ? true :false;
        }
        public void DeleteListDependent(List<UserProfileDependent> ids)
        {            
            if (ids.Count > 0)
            {
                BTOContext context = _entities as BTOContext;
                context.UserProjectDependent.RemoveRange(ids.AsEnumerable());
            }
            
            //_entities.SaveChanges();
        }
    }
}
