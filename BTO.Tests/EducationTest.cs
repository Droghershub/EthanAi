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
    public class EducationTest
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

            dream.purchase_age = 50;
            dream.total_cost = 400000;
            dream.payment_duration = 5;
        }

        [TestMethod]
        public void Test()
        {
            Education education = new Education(personaInfo, dream);

            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double expense = 0;
                foreach (AccountTypes.Expense type in Enum.GetValues(typeof(AccountTypes.Expense)))
                {
                    expense += education.Expense(type, age);
                }
                if (dream.purchase_age <= age && age < dream.purchase_age + dream.payment_duration)
                {
                    Assert.AreEqual(expense, (double)(dream.total_cost / dream.payment_duration) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge), "Fail at age: " + age);
                }              
            }
        }
    }
}
