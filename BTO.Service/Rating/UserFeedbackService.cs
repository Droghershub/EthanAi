using BTO.Model.Profile;
using BTO.Repository.Common;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Profile;
using BTO.Model.Rating;
using BTO.Repository.Rating;
namespace BTO.Service.Profile
{
    public class UserFeedbackService : EntityService<UserFeedback>, IUserFeedbackService
    {
        IUnitOfWork _unitOfWork;
        IUserFeedbackRepository _userFeedbackRepository;

        public UserFeedbackService(IUnitOfWork unitOfWork, IUserFeedbackRepository _userFeedbackRepository)
            : base(unitOfWork, _userFeedbackRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._userFeedbackRepository = _userFeedbackRepository;
        }

        public List<UserFeedback> GetAllByUser(Guid userId)
        {
            var feedback = _userFeedbackRepository.GetAll(userId);
            return feedback.ToList();
        }
        public UserFeedback PostUserFeedback(UserFeedback userFeedback)
        {
            this.Create(userFeedback);
            return userFeedback;
        }
    }
}
