using BTO.Common;
using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class ResidencePurchase : BaseObject
    {
        private Dream residence;
        public ResidencePurchase(PersonaInfo _personaInfo, Dream _residence) 
            : base(_personaInfo) {
                residence = _residence;
        }
        public override double Income(AccountTypes.Income type, int age)
        {           
            switch (type)
            {
                case AccountTypes.Income.RECURRING_INCOME:
                    if (residence.purchase_age <= age && (age < residence.sell_age || residence.sell_age == 0))
                    {
                        return (double)residence.total_cost*(double)residence.rental_net_income * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    }
                    return 0;
                default:
                    return 0;
            }
        }

        public override double Expense(AccountTypes.Expense type, int age)
        {
            switch (type)
            {
                           
                case AccountTypes.Expense.EXCEPTIONAL:
                    double result = 0;
                    // For AccountTypes.Expense.EXPENSE_FROM_RESIDENCE
                    if (residence.payment_duration >1 && residence.purchase_age == age)
                        result = (double)(residence.total_cost * residence.down_payment )* Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    else if (residence.payment_duration == 1 && residence.purchase_age == age)
                        result = (double)(residence.total_cost)* Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);                                      

                    // For AccountTypes.Expense.TRANSACTION_COST:
                    if (residence.purchase_age == age)
                        result += (double)(residence.total_cost * residence.transaction_cost) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);

                    

                    return result;

                case AccountTypes.Expense.RECURRING_EXPENSE:
                    result = 0;
                    // For AccountTypes.Expense.INTEREST: 
                    int ageFinish = residence.purchase_age + (int)residence.payment_duration;
                    if (residence.sell_age > 0 && ageFinish > residence.sell_age)
                        ageFinish = residence.sell_age;
                    if (residence.purchase_age < age && age < ageFinish)
                        result = Formula.Interest((double)residence.total_cost, (double)residence.mortage_interest_rate, (double)residence.down_payment, (int)residence.payment_duration, personaInfo.Inflation, residence.purchase_age, age, personaInfo.StartingAge);

                    // For AccountTypes.Expense.EXPENSE_YEARLY_FROM_RESIDENCE
                    if (residence.purchase_age <= age && (age < residence.sell_age || residence.sell_age == 0))
                        result += (double)(residence.total_cost * residence.yearly_expenses) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    return result;
               
                default:
                    return 0;
            }
        }
        public override double RemainingMortgage(int age)
        {
            if (residence.purchase_age == age && (double)residence.payment_duration == 1)
                return (double)residence.total_cost * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
            if (residence.purchase_age == age && (double)residence.payment_duration > 1)
                return (1 - (double)residence.down_payment) * (double)residence.total_cost * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
            int ageFinish = residence.purchase_age + (int)residence.payment_duration;
            if (residence.sell_age > 0 && ageFinish > residence.sell_age)
                ageFinish = residence.sell_age;
            if (residence.purchase_age < age && age < ageFinish)
            {
                return Formula.Mortage((double)residence.total_cost, (double)residence.down_payment, (int)residence.payment_duration, personaInfo.Inflation, residence.purchase_age, age, personaInfo.StartingAge);
            }
            return 0; 
            //return base.RemainingMortgage(age);
        }
        public override double IlliquidValue(int age)
        {
            if (residence.purchase_age <= age && (age < (residence.sell_age == 0 ? personaInfo.EndingAge + 1  : residence.sell_age)))
                return (double)residence.total_cost * Math.Pow(1 + (double)personaInfo.Inflation, age - personaInfo.StartingAge);
            return 0;
            //return base.IlliquidValue(age);
        }
    }
}
