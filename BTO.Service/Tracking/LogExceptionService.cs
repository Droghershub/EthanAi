using BTO.Model.Tracking;
using BTO.Repository.Common;
using BTO.Repository.Tracking;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Tracking
{
    public class LogExceptionService : EntityService<LogException>, ILogExceptionService
    {
        IUnitOfWork _unitOfWork;
        ILogExceptionRepository _logExceptionRepository;

        public LogExceptionService(IUnitOfWork unitOfWork, ILogExceptionRepository exceptionRepository)
            : base(unitOfWork, exceptionRepository)
        {
            _unitOfWork = unitOfWork;
            _logExceptionRepository = exceptionRepository;
        }
        public void AddLog(LogException log)
        {
            _logExceptionRepository.Add(log);
            _logExceptionRepository.Save();
        }
    }
}
