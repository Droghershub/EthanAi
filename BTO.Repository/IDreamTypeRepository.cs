using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
namespace BTO.Repository
{
    public interface IDreamTypeRepository : IGenericRepository<DreamType>
    {
        DreamType GetById(int id);
        List<DreamType> GetAllData();
    }
}
