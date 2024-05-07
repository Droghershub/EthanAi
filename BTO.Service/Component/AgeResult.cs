using BTO.Common;
using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class AgeResult
    {
        public HashSet<BaseObject> objectList;
        private int age;
        public Dictionary<AccountTypes.Income, double> income = new Dictionary<AccountTypes.Income, double>();
        public Dictionary<AccountTypes.Expense, double> expense = new Dictionary<AccountTypes.Expense, double>();
        public Dictionary<AccountTypes.Reduce, double> expenseReduction = new Dictionary<AccountTypes.Reduce, double>();        
        public AgeResult(HashSet<BaseObject> _objectList, int _age)
        {
            this.age = _age;
            objectList = _objectList;
        }


        public double TotalIncome(params AccountTypes.Income[] incom_list)
        {
            double income = 0;

            foreach (BaseObject item in objectList)
            {
                foreach (AccountTypes.Income type in incom_list)
                {
                    income += item.Income(type, age);
                }
            }

            return income;
        }

        public double TotalExpense(params AccountTypes.Expense[] expense_list)
        {
            double expense = 0;

            foreach (BaseObject item in objectList)
            {
                foreach (AccountTypes.Expense type in expense_list)
                {
                    expense += item.Expense(type, age);
                }
            }

            return expense;
        }


        public double TotalIncome()
        {
            double result = 0;
            foreach (BaseObject item in objectList)
            {
                foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
                {
                    if (!income.ContainsKey(type))
                        income.Add(type, item.Income(type, age));
                    else
                        income[type] = item.Income(type, age) + income[type];
                    result += item.Income(type, age);
                }
            }
            return result;
        }

        public double TotalExpense()
        {
            double result = 0;
            foreach (BaseObject item in objectList)
            {
                foreach (AccountTypes.Expense type in Enum.GetValues(typeof(AccountTypes.Expense)))
                {
                    if (!expense.ContainsKey(type))
                        expense.Add(type, item.Expense(type, age));
                    else
                        expense[type] = item.Expense(type, age) + expense[type];
                    result += item.Expense(type, age);
                }
            }
            return result;
        }

        public double TotalExpenseReduction(double total_income)
        {
            double result = 0;
            foreach (BaseObject item in objectList)
            {
                foreach (AccountTypes.Reduce type in Enum.GetValues(typeof(AccountTypes.Reduce)))
                {
                    if (!expenseReduction.ContainsKey(type))
                        expenseReduction.Add(type, item.ExpenseReduction(type, age, total_income));
                    else
                        expenseReduction[type] = item.ExpenseReduction(type, age, total_income) + expenseReduction[type];
                    result += item.ExpenseReduction(type, age, total_income);
                }
            }
            return result;
        }
        public double RemainingMortgage()
        {
            double result = 0;
            foreach (BaseObject item in objectList)
            {
                result += item.RemainingMortgage(this.age);
            }
            return result;
        }
        public double IlliquidValue()
        {
            double result = 0;
            foreach (BaseObject item in objectList)
            {
                result += item.IlliquidValue(this.age);
            }
            return result;
        }
        public double Calculate()
        {
            double total_income = this.TotalIncome();
            double total_expense = this.TotalExpense();
            double total_reduce = this.TotalExpenseReduction(total_income);
            total_expense = total_expense < total_reduce ? 0 : total_expense - total_reduce;
            return total_income  - total_expense;
        }
    }
}
