using BTO.Model.Tracking;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Tracking
{
    public interface ILogExceptionService :  IEntityService<LogException>
    {
        void AddLog(LogException logException);
    } 
}
