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
    public interface IConnectionService : IEntityService<Connection>
    {
        Connection GetById(int Id);
        List<Connection> GetByEmail(string Email);
        Connection GetByConnectionId(Guid connectionId);
        List<Guid> GetAllConnection(List<string> emails);
        void DeleteAllConnection();
       
    }
}
