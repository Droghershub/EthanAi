using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
namespace BTO.Service.Component
{
    public class BaseObject : IBaseObject
    {
        protected PersonaInfo personaInfo;
        public BaseObject(PersonaInfo _personaInfo)
        {
            this.personaInfo = _personaInfo;
        }
        public virtual double Income(AccountTypes.Income type, int age)
        {
            return 0;
        }
        public virtual double Expense(AccountTypes.Expense type, int age)
        {
            return 0;
        }

        public virtual double ExpenseReduction(AccountTypes.Reduce type, int age, double total_income)
        {
            return 0;
        }

        public virtual double RemainingMortgage(int age)
        {
            return 0;
        }
        public virtual double IlliquidValue(int age)
        {
            return 0;
        }
    }
}
