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
    public interface IDreamTypeService : IEntityService<DreamType>
    {
        DreamType GetById(int Id);
        List<DreamType> GetAllData();
    }
}
