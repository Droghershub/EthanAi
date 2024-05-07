using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service
{
    public interface IMainService
    {
        MainResult CalculatorBasic(PersonaPlan personaPlan);
        object CalculateIncomeExpense(PersonaPlan personaPlan);
        object CalculateEquityCurve(PersonaPlan personaPlan);
        object CalculateIlliquidCurve(PersonaPlan personaPlan);
        double[] IncomeYearByYear(PersonaPlan personaPlan);
        double[] ExpensesYearByYear(PersonaPlan personaPlan);
    }
}
