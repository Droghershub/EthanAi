﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Common
{  
    public interface IEntity<T> 
   {
       T id { get; set; }
   }
}
