using BTO.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class ExpenseBeforeRetirement : BaseObject
    {
        public ExpenseBeforeRetirement(PersonaInfo _personaInfo) : base(_personaInfo) { }
        public override double Expense(AccountTypes.Expense type, int age)
        {          
            switch (type)
            {
                case AccountTypes.Expense.EXPENSE_DURING_ACTIVE_LIFE:
                    if (age >= personaInfo.RetirementAge )
                    {
                        return 0;
                    }
                    return this.personaInfo.ExpenseBeforeRetirement * Math.Pow(1 + this.personaInfo.Inflation, age -this.personaInfo.StartingAge );                      
                default:
                    return 0;
            }            
        }
    }
}
