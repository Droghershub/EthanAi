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
    public class UserRatingService : EntityService<UserRating>, IUserRatingService
    {
        IUnitOfWork _unitOfWork;
        IUserRatingRepository _userRatingRepository;

        public UserRatingService(IUnitOfWork unitOfWork, IUserRatingRepository _userRatingRepository)
            : base(unitOfWork, _userRatingRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._userRatingRepository = _userRatingRepository;
        }

        public List<UserRating> GetUserRatingOfUser(Guid userId)
        {
            var rating = _userRatingRepository.GetAll(userId);
            return rating.ToList();
        }
        public UserRating PostUserRating(UserRating userRating)
        {
            this.Create(userRating);
            return userRating;
        }
    }
}
