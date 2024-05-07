using BTO.Common;
using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class ResidenceSale : BaseObject
    {
        private LifeEvent residenceSale;
        private Dream residencePurchase;

        public ResidenceSale(PersonaInfo _personaInfo, LifeEvent _residenceSale)
            : base(_personaInfo)
        {
            residenceSale = _residenceSale;
        }
        public ResidenceSale(PersonaInfo _personaInfo, LifeEvent _residenceSale, Dream _residencePurchase)
            : base(_personaInfo)
        {
            residenceSale = _residenceSale;
            residencePurchase = _residencePurchase;
        }

        public override double Income(AccountTypes.Income type, int age)
        {
            switch (type)
            {
                case AccountTypes.Income.EXCEPTIONAL:
                    if (residenceSale.starting_age == age)
                    {
                        return (double)(residenceSale.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    }
                    else
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
                    //AccountTypes.Expense.TRANSACTION_COST:
                    if (residenceSale.starting_age == age)
                    {
                        result += (double)((double)residenceSale.transaction_cost * (double)residenceSale.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    }
                    //AccountTypes.Expense.TAX:
                    if (residenceSale.starting_age == age)
                    {
                        double remainingMortgage = 0;
                        double valueBuyResidence = 0;
                        if (residencePurchase != null)
                        {
                            ResidencePurchase _residencePurchase = new ResidencePurchase(personaInfo, residencePurchase);
                            remainingMortgage= _residencePurchase.RemainingMortgage(age);
                            valueBuyResidence = (double)residencePurchase.total_cost * Math.Pow(1 + personaInfo.Inflation, residencePurchase.purchase_age - personaInfo.StartingAge);
                        }                       
                        
                        double valueRemain = (double)residenceSale.value * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge) - valueBuyResidence - remainingMortgage;
                        if (valueRemain > 0)
                            result += (double) residenceSale.transaction_tax * valueRemain;                        
                    }
                    //AccountTypes.Expense.DISPOSAL_MORTGAGE:
                    if (residencePurchase != null)
                    {
                        int number_year_remain = residencePurchase.purchase_age + (int)residencePurchase.payment_duration - residenceSale.starting_age;
                        if (number_year_remain > 0 && age == residenceSale.starting_age)
                        {
                            result += (double)(residencePurchase.total_cost * (1 - residencePurchase.down_payment)) / ((double)residencePurchase.payment_duration - 1) * number_year_remain;
                        }
                    }
                    return result;

                default:
                    return 0;
            }
        }
    }
}
