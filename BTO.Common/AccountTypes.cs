using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Common
{
    public static class AccountTypes
    {
        public enum Income
        {
            SALARY,
            SOCIAL_SECURITY,
            EXCEPTIONAL,            
            INCOME_FROM_RESIDENCE,
            INCOME_FROM_SALE_RESIDENCE,
            RECURRING_INCOME
        };
        public enum Expense
        {
            EXPENSE_DURING_ACTIVE_LIFE,
            EXPENSE_DURING_RETIREMENT_LIFE,
            TAX,            
            INTEREST,
            TRANSACTION_COST,
            EXCEPTIONAL,
            EXPENSE_FROM_RESIDENCE,
            EXPENSE_YEARLY_FROM_RESIDENCE,
            EXPENSE_FROM_EDUCATION,
            DISPOSAL_MORTGAGE,
            RECURRING_EXPENSE
        };

        public enum Reduce
        {            
            EXPENSE_CHILDREN_INDEPENDENT
        };
    }
}
