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
    public class InvitationRepository : GenericRepository<Invitation>, IInvitationRepository
    {
        public InvitationRepository(DbContext context)
            : base(context)
        {
           
        }
        public Invitation GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
        public IEnumerable<InvitationModel> GetInvitationList(DateTime startdate, DateTime enddate)
        {
            var para_startdate = new System.Data.SqlClient.SqlParameter("@startdate", startdate);
            var para_enddate = new System.Data.SqlClient.SqlParameter("@enddate", enddate);
            return this._entities.Database.SqlQuery<InvitationModel>("GetInvitationList @startdate, @enddate", para_startdate, para_enddate).ToList();
        }
       
    }
}
