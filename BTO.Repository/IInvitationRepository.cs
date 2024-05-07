using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;

namespace BTO.Repository
{
    public interface IInvitationRepository : IGenericRepository<Invitation>
    {
        Invitation GetById(int id);
        IEnumerable<InvitationModel> GetInvitationList(DateTime startdate, DateTime enddate);
    }
}
