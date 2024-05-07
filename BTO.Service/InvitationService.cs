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
    public class InvitationService : EntityService<Invitation>, IInvitationService
    {
        IUnitOfWork _unitOfWork;
        IInvitationRepository _invitationRepository;

        public InvitationService(IUnitOfWork unitOfWork, IInvitationRepository invitationRepository)
            : base(unitOfWork, invitationRepository)
        {
            _unitOfWork = unitOfWork;
            _invitationRepository = invitationRepository;
        }


        public Invitation GetById(int Id)
        {
            return _invitationRepository.GetById(Id);
        }

        public override void Create(Invitation entity)
        {
            _invitationRepository.Attached(entity);
            _invitationRepository.Add(entity);
            _invitationRepository.Save();
            //base.Create(entity);
        }
        public IEnumerable<InvitationModel> GetInvitationList(DateTime startdate, DateTime enddate)
        {
            return _invitationRepository.GetInvitationList(startdate,enddate);
        }


    }
}
