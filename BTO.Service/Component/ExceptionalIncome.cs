using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
using BTO.Model;

namespace BTO.Service.Component
{
    public class ExceptionalIncome: BaseObject
    {
        private LifeEvent exceptionalIncome;
        public ExceptionalIncome(PersonaInfo _personaInfo, LifeEvent _exceptionalIncome)
            : base(_personaInfo)
        {
            exceptionalIncome = _exceptionalIncome;
        }
        public override double Income(AccountTypes.Income type, int age)
        {
            switch (type)
            {
                case AccountTypes.Income.EXCEPTIONAL:
                    if (exceptionalIncome.starting_age == age)
                        return (double)(exceptionalIncome.value) ;
                    return 0;
               
                default:
                    return 0;
            }
        }
    }
}
