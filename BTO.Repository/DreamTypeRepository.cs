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
    public class DreamTypeRepository : GenericRepository<DreamType>, IDreamTypeRepository
    {
        public DreamTypeRepository(DbContext context)
            : base(context)
        {
           
        }
        public DreamType GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
        public List<DreamType> GetAllData()
        {
            List<DreamType> dreamTypes = _entities.Set<DreamType>().ToList();            
            return dreamTypes;
        }
    }
}
