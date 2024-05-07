using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public class DreamTypeConfigRepository : GenericRepository<DreamTypeConfig>, IDreamTypeConfigRepository
    {
        public DreamTypeConfigRepository(DbContext context)
            : base(context)
        {
           
        }
        public DreamTypeConfig GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
        public List<DreamTypeConfig> GetAllData()
        {
            return _entities.Database.SqlQuery<DreamTypeConfig>("GetAllDreamTypeConfig").ToList();
            //return _entities.Set<DreamTypeConfig>().ToList();
        }
        public List<DreamTypeConfig> GetByDreamTypeId(int dreamType_id)
        {
            return _entities.Set<DreamTypeConfig>().Where(t=>t.dream_type_id== dreamType_id).OrderBy(t => t.order).ToList();
        }
    }
}
