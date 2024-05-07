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
    public interface IDreamTypeConfigService : IEntityService<DreamTypeConfig>
    {
        DreamTypeConfig GetById(int Id);
        List<DreamTypeConfig> GetAllData();
        List<DreamTypeConfig> GetByDreamTypeId(int dreamType_id);
    }
}
