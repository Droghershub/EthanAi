using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IDreamRepository : IGenericRepository<Dream>
    {
        Dream GetById(int id);
    }
}
