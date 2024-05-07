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
    public class DreamRepository : GenericRepository<Dream>, IDreamRepository
    {
        public DreamRepository(DbContext context)
            : base(context)
        {
           
        }
        public Dream GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
       
    }
}
