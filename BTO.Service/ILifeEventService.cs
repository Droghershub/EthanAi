using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface ILifeEventService : IEntityService<LifeEvent>
    {
        LifeEvent GetById(int Id);
        //static Dream Copy(Dream source, Dream target);

        void DeleteAllByUserId(int Id);
        void UpdateDependentReferenceOfLifeEvent(int persona_plan_id, string oldValue, string newValue);
    }
}
