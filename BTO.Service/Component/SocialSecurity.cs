using BTO.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class SocialSecurity : BaseObject
    {
        public SocialSecurity(PersonaInfo _personaInfo) : base(_personaInfo) { }
        public override double Income(AccountTypes.Income type, int age)
        {

            switch (type)
            {
                case AccountTypes.Income.SOCIAL_SECURITY:
                    if (age < personaInfo.SocialSecurityAge)
                    {
                        return 0;
                    }
                    double social_security_percent = 0.5 + (this.personaInfo.SocialSecurityAge - 60) * 0.01;
                    if (this.personaInfo.StartingAge < this.personaInfo.RetirementAge)
                    {
                        double final_salary = this.personaInfo.SalaryIncome * Math.Pow(1 + this.personaInfo.SalaryIncreasement, this.personaInfo.RetirementAge - 1 - this.personaInfo.StartingAge);
                        return final_salary * social_security_percent * Math.Pow(1 + this.personaInfo.Inflation, age - this.personaInfo.RetirementAge + 1);
                    }
                    else
                        return this.personaInfo.SalaryIncome * social_security_percent * Math.Pow(1 + this.personaInfo.Inflation, age - this.personaInfo.RetirementAge + 1);


                default:
                    return 0;

            }
        }
    }
}
