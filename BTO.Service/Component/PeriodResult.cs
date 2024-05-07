using BTO.Common;
using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    class PeriodResult
    {
        private PersonaInfo personaInfo;
        public HashSet<BaseObject> objectList;
        public Dictionary<AccountTypes.Income, double[]> income = new Dictionary<AccountTypes.Income, double[]>();
        public Dictionary<AccountTypes.Expense, double[]> expense = new Dictionary<AccountTypes.Expense, double[]>();
        public Dictionary<AccountTypes.Reduce, double[]> expenseReduction = new Dictionary<AccountTypes.Reduce, double[]>();
        public List<double> cash_flow = new List<double>();
        public List<double> incomeTotal = new List<double>();
        public List<double> expenseTotal = new List<double>();
        public List<double> remainingMortgate = new List<double>();
        public List<double> illiquidAsset = new List<double>();
        public List<MonteCarloModel> equity = new List<MonteCarloModel>();


        public PeriodResult(PersonaInfo _personaInfo, HashSet<BaseObject> _objectList)
        {
            personaInfo = _personaInfo;
            objectList = _objectList;
            //remainingMortgage = new double[personaInfo.Period];
            Init();
        }
        private void Init()
        {
            foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
            {
                income.Add(type, new double[personaInfo.Period]);
            }

            foreach (AccountTypes.Expense type in Enum.GetValues(typeof(AccountTypes.Expense)))
            {
                expense.Add(type, new double[personaInfo.Period]);
            }

            foreach (AccountTypes.Reduce type in Enum.GetValues(typeof(AccountTypes.Reduce)))
            {
                expenseReduction.Add(type, new double[personaInfo.Period]);
            }
        }

        public void Calculate()
        {


            for (int i = personaInfo.StartingAge; i <= personaInfo.EndingAge; i++)
            {
                AgeResult ageResult = new AgeResult(objectList, i);
                double total_income = ageResult.TotalIncome();
                incomeTotal.Add(total_income);
                double total_expense = ageResult.TotalExpense();
                double total_redude = ageResult.TotalExpenseReduction(total_income);
                total_expense = total_expense < total_redude ? 0 : total_expense - total_redude;
                double cash = total_income - total_expense;
                cash_flow.Add(cash);
                expenseTotal.Add(total_expense);
                //for illiquid asset
                double mortgage_remaining = ageResult.RemainingMortgage();
                remainingMortgate.Add(mortgage_remaining);
                double illiquid_value = ageResult.IlliquidValue();
                illiquidAsset.Add(illiquid_value);

                foreach (AccountTypes.Income type in ageResult.income.Keys)
                {
                    income[type][i - personaInfo.StartingAge] = ageResult.income[type];
                }
                foreach (AccountTypes.Expense type in ageResult.expense.Keys)
                {
                    expense[type][i - personaInfo.StartingAge] = ageResult.expense[type];
                }
                foreach (AccountTypes.Reduce type in ageResult.expenseReduction.Keys)
                {
                    expenseReduction[type][i - personaInfo.StartingAge] = ageResult.expenseReduction[type];
                }
                //remainingMortgage[i - personaInfo.StartingAge] = ageResult.RemainingMortgage();
            }
            MonteCarlo monterCarlo = new MonteCarlo(this.personaInfo.NumberOfTrials, this.personaInfo.Volatility, this.personaInfo.RiskReturn, this.personaInfo.LiquidAsset,this.personaInfo.Top,this.personaInfo.Bottom, cash_flow);
            equity = monterCarlo.simulate();
        }
        public MainResult getMainResult()
        {
            if (equity.Count == 0)
                return null;
            MainResult result = new MainResult();

            for (int i = personaInfo.StartingAge; i <= personaInfo.EndingAge; i++)
            {
                if (result.broken_age == null && equity[i - personaInfo.StartingAge] != null && equity[i - personaInfo.StartingAge].BottomValue < 0)
                    result.broken_age = i;
                if (result.social_security == 0d && income[AccountTypes.Income.SOCIAL_SECURITY][i - personaInfo.StartingAge] > 0)
                {
                    result.social_security = income[AccountTypes.Income.SOCIAL_SECURITY][i - personaInfo.StartingAge];
                }

            }
            if (result.broken_age == null)
            {
               
                result.broken_age = personaInfo.EndingAge + 6;
            }
                
            result.social_security = Math.Round(result.social_security / 12);
            result.risk_return = 5 / 100;
            result.expected_return = 5 / 100;
            result.project_value = equity[personaInfo.RetirementAge - personaInfo.StartingAge].MediumValue < 0 ? 0 : equity[personaInfo.RetirementAge - personaInfo.StartingAge].MediumValue;
            result.saving_at_retirement = equity[personaInfo.RetirementAge - personaInfo.StartingAge].BottomValue < 0 ? 0 : equity[personaInfo.RetirementAge - personaInfo.StartingAge].BottomValue;

            return result;
        }
        public double[] getPeriodSalary()
        {
            return income[AccountTypes.Income.SALARY];
        }
        public double[] getPeriodSocialSecurity()
        {
            return income[AccountTypes.Income.SOCIAL_SECURITY];
        }
        public double[] getPeriodIncomeFromInvestment()
        {
            double[] result = new double[cash_flow.Count];
            double[] liquid_asset = getBottomEquityCurve();
            double liquid = 0;
            for (int i = 0; i < cash_flow.Count; i++)
            {
                if (cash_flow[i] < 0)
                {
                    if (i == 0)
                    {
                        liquid = personaInfo.LiquidAsset;
                    }
                    else
                        liquid = liquid_asset[i - 1];
                    if (liquid > 0)
                    {
                        result[i] = Math.Abs(cash_flow[i]) > liquid ? liquid : Math.Abs(cash_flow[i]);
                    }
                    else
                        result[i] = 0;

                }
                else
                    result[i] = 0;

            }
            return result;
        }

        public double[] getPeriodExceptionalIncome()
        {
            return income[AccountTypes.Income.EXCEPTIONAL];
        }

        public double[] getPeriodRecurringIncome()
        {
            return income[AccountTypes.Income.RECURRING_INCOME];
        }

        public double[] getPeriodOtherIncome()
        {
            double[] result = new double[personaInfo.Period];
            for (int i = 0; i < personaInfo.Period; i++)
            {
                result[i] = 0;
                foreach (AccountTypes.Income type in income.Keys)
                {
                    if (type != AccountTypes.Income.SALARY && type != AccountTypes.Income.SOCIAL_SECURITY && type != AccountTypes.Income.EXCEPTIONAL && type != AccountTypes.Income.RECURRING_INCOME)
                        result[i] += income[type][i];
                }
            }
            return result;
        }
        public double[] getPeriodExpenseBeforeRetirement()
        {
            double[] result = new double[personaInfo.Period];
            for (int i = 0; i < personaInfo.Period; i++)
            {
                if (i + personaInfo.StartingAge >= personaInfo.RetirementAge)
                {
                    result[i] = 0;
                    continue;
                }
                result[i] = expenseTotal[i] - expense[AccountTypes.Expense.EXCEPTIONAL][i] - expense[AccountTypes.Expense.RECURRING_EXPENSE][i];
            }
            return result;
        }
        public double[] getPeriodExpenseAfterRetirement()
        {
            double[] result = new double[personaInfo.Period];
            for (int i = 0; i < personaInfo.Period; i++)
            {
                if (i + personaInfo.StartingAge < personaInfo.RetirementAge)
                {
                    result[i] = 0;
                    continue;
                }
                result[i] = expenseTotal[i] - expense[AccountTypes.Expense.EXCEPTIONAL][i] - expense[AccountTypes.Expense.RECURRING_EXPENSE][i];
            }
            return result;
        }
        public double[] getPeriodSavingBeforeRetirement()
        {
            double[] result = new double[personaInfo.Period];
            for (int i = 0; i < personaInfo.Period; i++)
            {
                if (i + personaInfo.StartingAge >= personaInfo.RetirementAge)
                {
                    result[i] = 0;
                    continue;
                }
                result[i] = incomeTotal[i] < expenseTotal[i] ? 0 : incomeTotal[i] - expenseTotal[i];
            }
            return result;
        }
        public double[] getPeriodSavingAfterRetirement()
        {
            double[] result = new double[personaInfo.Period];
            for (int i = 0; i < personaInfo.Period; i++)
            {
                if (i + personaInfo.StartingAge < personaInfo.RetirementAge)
                {
                    result[i] = 0;
                    continue;
                }
                result[i] = incomeTotal[i] < expenseTotal[i] ? 0 : incomeTotal[i] - expenseTotal[i];
            }
            return result;
        }
        public double[] getPeriodExceptionalExpense()
        {
            return expense[AccountTypes.Expense.EXCEPTIONAL];
        }

        public double[] getPeriodRecurringExpense()
        {
            return expense[AccountTypes.Expense.RECURRING_EXPENSE];
        }

        public double[] getBottomEquityCurve()
        {
            double[] result = new double[equity.Count + 1];
            for (int i = 0; i < result.Length; i++)
            {
                if (i > 0)
                    result[i] = equity[i-1].BottomValue;
                else
                    result[i] = personaInfo.LiquidAsset;
            }
            return result;
        }
        public double[] getMediumEquityCurve()
        {
            double[] result = new double[equity.Count + 1];
            for (int i = 0; i < result.Length; i++)
            {
                if (i > 0)
                    result[i] = equity[i-1].MediumValue;
                else
                    result[i] = personaInfo.LiquidAsset;
            }
            return result;
        }
        public double[] getTopEquityCurve()
        {
            double[] result = new double[equity.Count + 1];
            for (int i = 0; i < result.Length; i++)
            {
                if (i > 0)
                    result[i] = equity[i-1].TopValue;
                else
                    result[i] = personaInfo.LiquidAsset;
            }
            return result;
        }
        public double[] getZeroEquityCurve()
        {
            double[] result = new double[cash_flow.Count];
            result[0] = personaInfo.LiquidAsset + cash_flow[0];
            for (int i = 1; i < result.Length; i++)
            {
                result[i] = result[i - 1] + cash_flow[i];
            }
            double[] resultFinal = new double[cash_flow.Count+1];
            resultFinal[0] = personaInfo.LiquidAsset;
            for (int i = 1; i < resultFinal.Length; i++)
            {
                resultFinal[i] = result[i - 1] ;
            }
            return resultFinal;
        }
        public double[] getPeriodAssetValue()
        {
            return illiquidAsset.ToArray();
        }
        public double[] getPeriodNetEquityValue()
        {
            double[] result = new double[illiquidAsset.Count];
            for (int i = 0; i < result.Length; i++)
            {
                result[i] = illiquidAsset[i] - remainingMortgate[i];
            }
            return result;
        }
    }
}
