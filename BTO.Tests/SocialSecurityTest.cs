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
    public class SocialSecurityTest
    {
        PersonaInfo personaInfo = new PersonaInfo();
        [TestInitialize()]
        public void Initialize()
        {
            personaInfo.SalaryIncome = 120000;
            personaInfo.StartingAge = 42;
            personaInfo.EndingAge = 80;
            personaInfo.RetirementAge = 60;
            personaInfo.SocialSecurityAge = 65;
            personaInfo.SalaryIncreasement = 0.1;
            personaInfo.Inflation = 0.1;
        }

        
        public void Test()
        {
            SocialSecurity socialSecurity = new SocialSecurity(personaInfo);

                      
            Salary salary = new Salary(personaInfo);
            for (int age = personaInfo.StartingAge; age <= personaInfo.EndingAge; ++age)
            {
                double incomeFromSocialSecurity = 0;
                foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
                {
                    incomeFromSocialSecurity += socialSecurity.Income(type, age);
                }
                if (age < personaInfo.SocialSecurityAge)
                    Assert.AreEqual(incomeFromSocialSecurity, 0, "Fail for age" + age);
                if (age >= personaInfo.SocialSecurityAge)
                {
                    double incomelasted = 0;
                    foreach (AccountTypes.Income type in Enum.GetValues(typeof(AccountTypes.Income)))
                    {
                        incomelasted += salary.Income(type, personaInfo.RetirementAge);
                    }
                    double social_security_percent = 0.5 + (this.personaInfo.SocialSecurityAge - 60) * 0.01;
                    Assert.AreEqual(incomeFromSocialSecurity, incomelasted * social_security_percent * Math.Pow(1 + this.personaInfo.Inflation, age - this.personaInfo.RetirementAge), "Fail for age" + age);
                }

            }
        }
    }
}
