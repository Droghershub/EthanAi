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
    public class AspNetUserRepository : GenericRepository<AspNetUser>, IAspNetUserRepository
    {
        public AspNetUserRepository(DbContext context)
            : base(context)
        {
           
        }
        public AspNetUser GetById(Guid id)
        {
            return FindBy(x => x.id == id.ToString()).FirstOrDefault();            
        }

        public void UpdateEmail(string _id, string newEmail)
        {
            AspNetUser aspNetUser = FindBy(x => x.id == _id).FirstOrDefault();
            if (aspNetUser != null)
            {
                aspNetUser.UserName = newEmail;
                aspNetUser.Email = newEmail;
                this.Edit(aspNetUser);
                this.SaveChange();
            }
        }
        public AspNetUser UpdateUser(AspNetUser user)
        {
            AspNetUser aspNetUser = FindBy(x => x.id == user.id).FirstOrDefault();
            if (aspNetUser != null)
            {
                aspNetUser.LockoutEndDateUtc = user.LockoutEndDateUtc;                
                this.Edit(aspNetUser);
                this.SaveChange();
                return aspNetUser;
            }
            return null;
        }
        public bool CheckEmailExisting(string _user_id, string _email)
        {
            IEnumerable<AspNetUser> list = FindBy(x => x.Email == _email && x.id != _user_id);
            int count = list.Count();
            return (list.Count() > 0 ? true : false);
        }
        public int getCountSessions(int start, int number, string email)
        {
            return _dbset.Where(item => email == "" || item.Email.ToLower().Contains(email.ToLower())).Count();
        }
        public IEnumerable<AspNetUserDTO> getSessions(int start, int number, string email)
        {
            var para_start = new System.Data.SqlClient.SqlParameter("@start", start);
            var para_number = new System.Data.SqlClient.SqlParameter("@number", number);
            var para_textsearch = new System.Data.SqlClient.SqlParameter("@textsearch", email);
            return this._entities.Database.SqlQuery<AspNetUserDTO>("GetUsers @start, @number, @textsearch", para_start, para_number, para_textsearch).ToList();


            //return _dbset.Where(item => email == "" || item.Email.ToLower().Contains(email.ToLower())).Select(t => new
            //{
            //    t.id,
            //    t.Email ,
            //    t.LockoutEndDateUtc,
            //    t.LockoutEnabled,
            //    t.AccessFailedCount,
            //    t.UserName
            //}).OrderBy(z => z.Email).Skip(start).Take(number).AsEnumerable().Select(x => new AspNetUser()
            //{
            //    id = x.id,
            //    Email =x.Email ,
            //    LockoutEndDateUtc = x.LockoutEndDateUtc,
            //    LockoutEnabled = x.LockoutEnabled,
            //    AccessFailedCount = x.AccessFailedCount,
            //    UserName = x.UserName
            //});
        }

        public string GetEmailFromProviderKey(string login_provider_id)
        {

            var para_login_provider_id = new System.Data.SqlClient.SqlParameter("@login_provider_id", login_provider_id);
            return this._entities.Database.SqlQuery<string>("GetEmailFromProviderKey @login_provider_id", para_login_provider_id).FirstOrDefault();
        }

        public AspNetUser GetDisableProviderListByUserId(Guid user_id)
        {
            return FindBy(x => x.id.Equals(user_id)).FirstOrDefault();
        }


        public void UpdateDisableProviderList(Guid user_id, string listProvider)
        {
            AspNetUser aspNetUser = FindBy(x => x.id == user_id.ToString()).FirstOrDefault();
            if (aspNetUser != null)
            {
                aspNetUser.DisableProviderList = listProvider;
                this.Edit(aspNetUser);
                this.SaveChange();
            }
        }
    }
}
