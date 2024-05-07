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
    public class ExpenseBeforeRetirementTest
    {
        PersonaInfo personaInfo = new PersonaInfo();
        

        [TestInitialize()]
        public void Initialize()
        {
            personaInfo.SalaryIncome = 120000;
            personaInfo.StartingAge = 42;
            personaInfo.EndingAge = 80;
            personaInfo.RetirementAge = 60;
            personaInfo.SalaryIncreasement = 0.1;
            personaInfo.ExpenseBeforeRetirement = 400000;
            personaInfo.Inflation = 0.1;
                       
        }

        [TestMethod]
        public void Test()
        {
            ExpenseBeforeRetirement expenseBeforeRetirement = new ExpenseBeforeRetirement(personaInfo);

            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double expense = 0;
                foreach (AccountTypes.Expense type in Enum.GetValues(typeof(AccountTypes.Expense)))
                {
                    expense += expenseBeforeRetirement.Expense(type, age);
                }
                if (age >= personaInfo.RetirementAge)
                    Assert.AreEqual(expense, 0, "Fail at age: " + age);
                else
                    Assert.AreEqual(expense, personaInfo.ExpenseBeforeRetirement * Math.Pow(1 + this.personaInfo.Inflation, age - this.personaInfo.StartingAge), "Fail at age: " + age);
            }
        }
    }
}
