using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IGroupRepository : IGenericRepository<Group>
    {
        Group GetById(int id);
    }
}
