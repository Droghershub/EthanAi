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
    public interface IAspNetUserService : IEntityService<AspNetUser>
    {
        AspNetUser GetById(Guid Id);
        void UpdateEmail(string _id, string newEmail);
        bool CheckEmailExisting(string _user_id, string _email);
        int getCountSessions(int start, int number, string email);
        System.Collections.Generic.IEnumerable<AspNetUserDTO> getSessions(int start, int number, string email);
        AspNetUser UpdateUser(AspNetUser user);
        string GetEmailFromProviderKey(string login_provider_id);
        AspNetUser GetDisableProviderListByUserId(Guid userId);
        AspNetUser GetByEmail(string email);

        void UpdateDisableProviderList(Guid user_id, string listProvider);
    }
}
