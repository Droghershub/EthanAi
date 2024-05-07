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
    public class TutorialService : EntityService<Tutorial>, ITutorialService
    {
        IUnitOfWork _unitOfWork;
        ITutorialRepository _tutorialRepository;

        public TutorialService(IUnitOfWork unitOfWork, ITutorialRepository _tutorialRepository)
            : base(unitOfWork, _tutorialRepository)
        {
            _unitOfWork = unitOfWork;
            this._tutorialRepository = _tutorialRepository;
        }

    }
}
