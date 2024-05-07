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
    public class ChildrenIndependentTest
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
            dream.yearly_cost_reduction  = 0.1M;
            
        }

        [TestMethod]
        public void Test()
        {
            ChildrenIndependent childrenIndependent = new ChildrenIndependent(personaInfo, dream);

            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double reduce = 0;
                foreach (AccountTypes.Reduce type in Enum.GetValues(typeof(AccountTypes.Reduce)))
                {
                    reduce += childrenIndependent.ExpenseReduction(type, age, 100000);
                }
                if (dream.starting_age <= age)
                    Assert.AreEqual(reduce, 100000 * 0.1, "Fail at age: " + age);
                else
                    Assert.AreEqual(reduce, 0, "Fail at age: " + age);
            }
        }
    }
}
