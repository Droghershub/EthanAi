using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model.Tracking
{    
    public class TrackPropertyChange
    {        
        public string fieldname { get; set; }
        public string fromvalue { get; set; }
        public string tovalue { get; set; }        
    }
    public class TrackObjectChange
    {
        public int id{get;set;}
        public string type { get; set; }
        public List<TrackPropertyChange> listchange { get; set; }
    }
}
