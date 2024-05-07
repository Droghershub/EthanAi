using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Common;
using BTO.Model;

namespace BTO.Service.Component
{
    public class Education : BaseObject
    {
        private Dream education;
        public Education(PersonaInfo _personaInfo, Dream _education) : base(_personaInfo) {
            education = _education;
        }
        public override double Expense(AccountTypes.Expense type, int age)
        {
            switch (type)
            {
                case AccountTypes.Expense.RECURRING_EXPENSE:
                    if (education.purchase_age <= age && age < education.purchase_age + education.payment_duration)
                        return (double)(education.total_cost / education.payment_duration) * Math.Pow(1 + personaInfo.Inflation, age - personaInfo.StartingAge);
                    return 0;               
                default:
                    return 0;
            }
        }
    }
}
