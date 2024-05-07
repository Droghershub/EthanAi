using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
using BTO.Model;

namespace BTO.Service.Component
{
    public class ExceptionalExpense: BaseObject
    {
        private Dream exceptionalExpense;
        public ExceptionalExpense(PersonaInfo _personaInfo, Dream _exceptionalExpense)
            : base(_personaInfo)
        {
            exceptionalExpense = _exceptionalExpense;
        }
        public override double Expense(AccountTypes.Expense type, int age)
        {
            switch (type)
            {
                case AccountTypes.Expense.EXCEPTIONAL:
                    if (exceptionalExpense.purchase_age == age)
                        return (double)(exceptionalExpense.total_cost) ;
                    return 0;
               
                default:
                    return 0;
            }
        }
    }
}
