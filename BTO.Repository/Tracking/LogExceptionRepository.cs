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
    public class LogExceptionRepository : GenericRepository<LogException>, ILogExceptionRepository
    {
        public LogExceptionRepository(DbContext context)
            : base(context)
        {

        }
    }
}
