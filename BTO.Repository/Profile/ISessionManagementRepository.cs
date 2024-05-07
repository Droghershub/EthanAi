using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Common;
using BTO.Model.Profile;
namespace BTO.Repository.Profile
{
    public interface ISessionManagementRepository :IGenericRepository<SessionModel>
    {

        int DeleteByUserId(Guid userId);
    }
}
