using BTO.Model.Profile;
using BTO.Model;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Payment
{
    public class PaymentRepository : GenericRepository<BTO.Model.Payment>, IPaymentRepository
    {
        public PaymentRepository(DbContext context)
            : base(context)
        {

        }

    }
}
