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
    public class AspNetUserService : EntityService<AspNetUser>, IAspNetUserService
    {
        IUnitOfWork _unitOfWork;
        IAspNetUserRepository _aspNetUserRepository;

        public AspNetUserService(IUnitOfWork unitOfWork, IAspNetUserRepository aspNetUserRepository)
            : base(unitOfWork, aspNetUserRepository)
        {
            _unitOfWork = unitOfWork;
            _aspNetUserRepository = aspNetUserRepository;
        }

        public AspNetUser GetById(Guid Id)
        {
            return _aspNetUserRepository.GetById(Id);
        }
        public AspNetUser GetByEmail(string email)
        {
            return _aspNetUserRepository.FindBy(x => x.Email == email).FirstOrDefault();
        }   

        public void UpdateEmail(string _id, string newEmail)
        {
            _aspNetUserRepository.UpdateEmail(_id, newEmail);
        }

        public bool CheckEmailExisting(string _user_id, string _email)
        {
            return _aspNetUserRepository.CheckEmailExisting(_user_id, _email);
        }
        public int getCountSessions(int start, int number, string email)
        {
            return _aspNetUserRepository.getCountSessions(start, number, email);
        }
        public System.Collections.Generic.IEnumerable<AspNetUserDTO> getSessions(int start, int number, string email)
        {
            return _aspNetUserRepository.getSessions(start, number, email);
        }
        public AspNetUser UpdateUser(AspNetUser user)
        {
            return _aspNetUserRepository.UpdateUser(user);
        }

        public string GetEmailFromProviderKey(string login_provider_id)
        {
            return _aspNetUserRepository.GetEmailFromProviderKey(login_provider_id);            
        }

        public AspNetUser GetDisableProviderListByUserId(Guid user_id)
        {
            return _aspNetUserRepository.GetDisableProviderListByUserId(user_id);
        } 
        public void UpdateDisableProviderList(Guid user_id, string listProvider)
        {
            _aspNetUserRepository.UpdateDisableProviderList(user_id, listProvider);
        }
    }
}
