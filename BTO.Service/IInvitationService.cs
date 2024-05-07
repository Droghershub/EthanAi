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
    public interface IInvitationService : IEntityService<Invitation>
    {
        Invitation GetById(int Id);
        IEnumerable<InvitationModel> GetInvitationList(DateTime startdate, DateTime enddate);
    }
}
