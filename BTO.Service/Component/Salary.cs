using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
namespace BTO.Service.Component
{
    public class Salary : BaseObject
    {
        public Salary(PersonaInfo _personaInfo) : base(_personaInfo) { }
        public override double Income(AccountTypes.Income type, int age)
        {          
            switch (type)
            {
                case AccountTypes.Income.SALARY:
                    if (age >= personaInfo.RetirementAge)
                    {
                        return 0;
                    }
                    return this.personaInfo.SalaryIncome * Math.Pow(1 + this.personaInfo.SalaryIncreasement, age -this.personaInfo.StartingAge );                      
                default:
                    return 0;
            }            
        }
       
    }
}
