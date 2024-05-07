using BTO.Common;
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
    public class SalaryTest
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
        }

        
        public void Test()
        {
            Salary salary = new Salary(personaInfo);

            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double income = 0;
                foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
                {
                    income += salary.Income(type, age);
                }
                if (age <= personaInfo.RetirementAge)
                    Assert.AreEqual(income, personaInfo.SalaryIncome * Math.Pow(1 + this.personaInfo.SalaryIncreasement, age - this.personaInfo.StartingAge), "Fail at age: "+ age);
                else Assert.AreEqual(income, 0, "Fail for age" + age);
            }
        }
    }
}
