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
    public class MemberRepository : GenericRepository<Member>, IMemberRepository
    {
        public MemberRepository(DbContext context)
            : base(context)
        {
           
        }
        public Member GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
       
    }
}
