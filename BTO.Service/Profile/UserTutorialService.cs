using BTO.Model.Profile;
using BTO.Repository.Common;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Profile;
namespace BTO.Service.Profile
{
    public class UserTutorialService : EntityService<UserTutorial>, IUserTutorialService
    {
        IUnitOfWork _unitOfWork;
        IUserTutorialRepository _userTutorialRepository;

        public UserTutorialService(IUnitOfWork unitOfWork, IUserTutorialRepository _userTutorialRepository)
            : base(unitOfWork, _userTutorialRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._userTutorialRepository = _userTutorialRepository;
        }


        public List<UserTutorial> GetUserTutorialByUserId(Guid user_id)
        {
            List<UserTutorial> tutorialList = _userTutorialRepository.FindBy(item => item.user_login_id == user_id).ToList<UserTutorial>();
            return tutorialList;
        }
    }
}
