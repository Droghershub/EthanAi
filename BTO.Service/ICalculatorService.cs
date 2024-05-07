using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service
{
    public interface ICalculatorService
    {
        //void Init(PersonaPlan personaPlan);
        //void Calculate(PersonaPlan personaPlan);
        MainResult CalculatorBasic(PersonaPlan personaPlan);
        object CalculateAll(PersonaPlan personaPlan);
        object CalculateIncomeExpense(PersonaPlan personaPlan);
        object CalculateEquityCurve(PersonaPlan personaPlan);
        object CalculateIlliquidCurve(PersonaPlan personaPlan);
        string[] CalculateRanking(PersonaPlan personaPlan);
    }
}
