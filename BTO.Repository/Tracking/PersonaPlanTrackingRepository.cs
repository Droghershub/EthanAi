using BTO.Model.Tracking;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Tracking
{
    public class PersonaPlanTrackingRepository : GenericRepository<PersonalPlanTracking>, IPersonaPlanTrackingRepository
    {

        public PersonaPlanTrackingRepository(DbContext context)
            : base(context)
        {

        }
    }
}
