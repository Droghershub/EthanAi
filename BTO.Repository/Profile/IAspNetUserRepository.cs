using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IAspNetUserRepository : IGenericRepository<AspNetUser>
    {
        AspNetUser GetById(Guid id);
        void UpdateEmail(string _id, string newEmail);
        bool CheckEmailExisting(string _user_id, string _email);
        int getCountSessions(int start, int number, string email);
        System.Collections.Generic.IEnumerable<AspNetUserDTO> getSessions(int start, int number, string email);
        AspNetUser UpdateUser(AspNetUser user);
        string GetEmailFromProviderKey(string login_provider_id);

        AspNetUser GetDisableProviderListByUserId(Guid user_id);


        void UpdateDisableProviderList(Guid user_id, string listProvider);
    }
}
