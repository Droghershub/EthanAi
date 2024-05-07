using BTO.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class ExpenseAfterRetirement : BaseObject
    {
        public ExpenseAfterRetirement(PersonaInfo _personaInfo) : base(_personaInfo) { }
        public override double Expense(AccountTypes.Expense type, int age)
        {          
            switch (type)
            {
                case AccountTypes.Expense.EXPENSE_DURING_RETIREMENT_LIFE:
                    if (age >= personaInfo.RetirementAge)
                    {
                        return this.personaInfo.ExpenseAfterRetirement * Math.Pow(1 + this.personaInfo.Inflation, age - this.personaInfo.StartingAge);                      
                        
                    }
                        return 0;
                    
                default:
                    return 0;
            }            
        }
    }
}
