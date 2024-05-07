using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IConnectionRepository : IGenericRepository<Connection>
    {
        Connection GetById(int id);
    }
}
