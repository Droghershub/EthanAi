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
    public class ExceptionalIncomeTest
    {
        PersonaInfo personaInfo = new PersonaInfo();
        LifeEvent dream = new LifeEvent();

        [TestInitialize()]
        public void Initialize()
        {
            personaInfo.SalaryIncome = 120000;
            personaInfo.StartingAge = 42;
            personaInfo.EndingAge = 80;
            personaInfo.RetirementAge = 60;
            personaInfo.SalaryIncreasement = 0.1;

            dream.starting_age = 50;
            dream.value = 400000;
        }

        [TestMethod]
        public void Test()
        {
            ExceptionalIncome exceptionalIncome = new ExceptionalIncome(personaInfo, dream);

            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double income = 0;
                foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
                {
                    income += exceptionalIncome.Income(type, age);
                }
                if (dream.starting_age == age)
                    Assert.AreEqual(income, (double)(dream.value), "Fail at age: " + age);
                else
                    Assert.AreEqual(income, 0, "Fail at age: " + age);
            }
        }
    }
}
