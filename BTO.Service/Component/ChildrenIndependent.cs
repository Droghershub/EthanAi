using BTO.Common;
using BTO.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Component
{
    public class ChildrenIndependent : BaseObject
    {
        private LifeEvent childrenIndependent;
        public ChildrenIndependent(PersonaInfo _personaInfo, LifeEvent _childrenIndependent) 
            : base(_personaInfo) {
                childrenIndependent = _childrenIndependent;
        }

        public override double ExpenseReduction(AccountTypes.Reduce type, int age, double total_income)
        {
            switch (type)
            {
                case AccountTypes.Reduce.EXPENSE_CHILDREN_INDEPENDENT:
                    if (childrenIndependent.starting_age <= age)
                        return total_income * (double)childrenIndependent.yearly_cost_reduction;
                    else
                        return 0;

                default:
                    return 0;
            }
        }
    }
}
