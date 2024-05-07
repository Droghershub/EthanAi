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
    public class ConnectionService : EntityService<Connection>, IConnectionService
    {
        IUnitOfWork _unitOfWork;
        IConnectionRepository _connectionRepository;

        public ConnectionService(IUnitOfWork unitOfWork, IConnectionRepository connectionRepository)
            : base(unitOfWork, connectionRepository)
        {
            _unitOfWork = unitOfWork;
            _connectionRepository = connectionRepository;
        }


        public Connection GetById(int Id)
        {
            return _connectionRepository.GetById(Id);
        }

        public List<Connection> GetByEmail(string Email)
        {
            return _connectionRepository.FindBy(x => x.email == Email).ToList();
        }

        public Connection GetByConnectionId(Guid connectionId)
        {
            return _connectionRepository.FindBy(x => x.connection_id == connectionId).SingleOrDefault();
        }


        public List<Guid> GetAllConnection(List<string> emails)
        {
            List<Connection> connections = _connectionRepository.FindBy(x => emails.Contains(x.email)).ToList();
            return connections.Select(x => x.connection_id).ToList();
        }

        public void DeleteAllConnection()
        {
            this.Delete(x => x.id > 0);            
        }
      
    }
}
