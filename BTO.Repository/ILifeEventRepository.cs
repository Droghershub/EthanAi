using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface ILifeEventRepository : IGenericRepository<LifeEvent>
    {
        LifeEvent GetById(int id);
    }
}
