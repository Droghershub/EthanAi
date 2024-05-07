using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Common
{
    public abstract class BaseEntity { 
    
    }

    public abstract class Entity<T> : BaseEntity, IEntity<T> 
    {
        public virtual T id { get; set; }
    }
}
