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
    public class ResidenceSaleTest
    {
        PersonaInfo personaInfo = new PersonaInfo();
        LifeEvent dream = new LifeEvent();
        Dream residencePurchase = new Dream();
        [TestInitialize()]
        public void Initialize()
        {
            personaInfo.SalaryIncome = 120000;
            personaInfo.StartingAge = 42;
            personaInfo.EndingAge = 80;
            personaInfo.RetirementAge = 60;
            personaInfo.SalaryIncreasement = 0.1;
            personaInfo.Inflation = 0.1;

            dream.starting_age = 50;
            dream.value = 400000;            
            dream.transaction_cost = 0.1M;
            dream.transaction_tax = 0.05M;

            residencePurchase.purchase_age = 55;
            residencePurchase.total_cost = 500000;
            residencePurchase.payment_duration = 10;

        }

        
        public void TestHasResidencePurchase()
        {
            ResidenceSale education = new ResidenceSale(personaInfo, dream, residencePurchase);

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


                if (dream.starting_age == age)
                {
                    double total_income = (double)(dream.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    Assert.AreEqual(income, total_income, "Fail at age: " + age);

                    double total_expense = (double)(dream.transaction_cost * dream.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge)
                        + (double)(dream.transaction_tax * dream.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);

                    if (residencePurchase != null)
                    {
                        int number_year_remain = residencePurchase.purchase_age + (int)residencePurchase.payment_duration - dream.starting_age;
                        if (number_year_remain > 0 && age == dream.starting_age)
                        {
                            total_expense += (double)(residencePurchase.total_cost * (1 - residencePurchase.down_payment)) / ((double)residencePurchase.payment_duration - 1) * number_year_remain;
                        }
                    }
                    Assert.AreEqual(expense, total_expense, "Fail at age: " + age);

                }
                else
                {
                    Assert.AreEqual(income, 0, "Fail at age: " + age);
                }
                
            }
        }

        [TestMethod]
        public void TestNoResidencePurchase()
        {
            ResidenceSale education = new ResidenceSale(personaInfo, dream);

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


                if (dream.starting_age == age)
                {
                    double total_income = (double)(dream.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    Assert.AreEqual(income, total_income, "Fail at age: " + age);

                    double total_expense = (double)(dream.transaction_cost * dream.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge)
                        + (double)(dream.transaction_tax * dream.value) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);

                   
                    Assert.AreEqual(expense, total_expense, "Fail at age: " + age);

                }
                else
                {
                    Assert.AreEqual(income, 0, "Fail at age: " + age);
                }

            }
        }
    }
}
