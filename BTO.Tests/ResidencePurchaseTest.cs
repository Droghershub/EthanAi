using BTO.Common;
using BTO.Model;
using BTO.Service;
using BTO.Service.Component;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Tests
{
    [TestClass]
    public class ResidencePurchaseTest
    {
        PersonaInfo personaInfo = new PersonaInfo();
        Dream dream = new Dream();
        [TestInitialize()]
        public void Initialize()
        {
            personaInfo.SalaryIncome = 120000;
            personaInfo.StartingAge = 42;
            personaInfo.EndingAge = 80;
            personaInfo.RetirementAge = 60;
            personaInfo.SalaryIncreasement = 0.1;
            personaInfo.Inflation = 0.1;

            dream.purchase_age = 50;
            dream.total_cost = 400000;
            dream.payment_duration = 5;
            dream.down_payment = 0.1M;
            dream.transaction_cost = 0.05M;
            dream.yearly_expenses = 0.06M;
        }

        [TestMethod]
        public void Test()
        {
            ResidencePurchase education = new ResidencePurchase(personaInfo, dream);

            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double expense = 0;
                foreach (AccountTypes.Expense type in Enum.GetValues(typeof(AccountTypes.Expense)))
                {
                    expense += education.Expense(type, age);
                }

                double income = 0;
                foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
                {
                    income += education.Income(type, age);
                }


                if (dream.purchase_age <= age && (age < dream.sell_age || dream.sell_age == 0))
                {
                    double total_income = (double)dream.total_cost * (double)dream.rental_net_income * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    Assert.AreEqual(income, total_income, "Fail at age: " + age);
                }

                if (dream.purchase_age == age)
                {
                    double total_expense = (double)(dream.total_cost * dream.transaction_cost) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge)
                        + (double)(dream.total_cost * dream.down_payment) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge)
                        + (double)(dream.total_cost * dream.yearly_expenses) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge)
                        ;
                    Assert.AreEqual(expense, total_expense, "Fail at age: " + age);
                }

                if (dream.purchase_age < age && age < (dream.sell_age == 0 ? dream.purchase_age + dream.payment_duration : dream.sell_age))
                {
                    double total_expense = (double)(dream.total_cost * dream.yearly_expenses) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge)
                        + Formula.Interest((double)dream.total_cost, (double)dream.mortage_interest_rate, (double)dream.down_payment, (int)dream.payment_duration, personaInfo.Inflation, dream.purchase_age, age, personaInfo.StartingAge);
                    Assert.AreEqual(expense, total_expense, "Fail at age: " + age);
                }

                if (dream.sell_age == 0 &&  age >= dream.purchase_age + dream.payment_duration)
                {
                    double total_expense = (double)(dream.total_cost * dream.yearly_expenses) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    Assert.AreEqual(expense, total_expense, "Fail at age: " + age);
                }

                if (dream.sell_age != 0 &&  age >= dream.sell_age)
                {
                    Assert.AreEqual(expense, 0, "Fail at age: " + age);
                }
                            
            }
        }
    }
}
