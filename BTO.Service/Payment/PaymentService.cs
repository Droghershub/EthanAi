using BTO.Model.Profile;
using BTO.Repository.Common;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository.Profile;
using BTO.Model.Rating;
using BTO.Repository.Rating;
using BTO.Repository.Payment;
namespace BTO.Service.Payment
{
    public class PaymentService : EntityService<BTO.Model.Payment>, IPaymentService
    {
        IUnitOfWork _unitOfWork;
        IPaymentRepository _paymentRepository;

        public PaymentService(IUnitOfWork unitOfWork, IPaymentRepository _paymentRepository)
            : base(unitOfWork, _paymentRepository)
        {
            
            this._unitOfWork = unitOfWork;
            this._paymentRepository = _paymentRepository;
        }

        
    }
}
