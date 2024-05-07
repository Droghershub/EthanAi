using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
using BTO.Service.Common;
namespace BTO.Service.Component
{
    public interface IBaseObject
    {        
        double Income(AccountTypes.Income type, int age);
        double Expense(AccountTypes.Expense type, int age);
        double ExpenseReduction(AccountTypes.Reduce type, int age, double total_income);

        double RemainingMortgage(int age);
        double IlliquidValue(int age);
    }
}
