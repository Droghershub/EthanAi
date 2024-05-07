using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;
namespace BTO.Repository
{
    public interface IDreamTypeConfigRepository : IGenericRepository<DreamTypeConfig>
    {
        DreamTypeConfig GetById(int id);
        List<DreamTypeConfig> GetAllData();
        List<DreamTypeConfig> GetByDreamTypeId(int dreamType_id);
    }
}
