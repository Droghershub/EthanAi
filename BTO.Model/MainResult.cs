using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model
{
    public class MainResult
    {
        public Nullable<int> broken_age { get; set; }
        public double social_security { get; set; }
        public double risk_return { get; set; }
        public double expected_return { get; set; }
        public double project_value { get; set; }
        public double saving_at_retirement { get; set; }
        public double expense_at_retirement { get; set; }
        public int processing_time { get; set; }

    }
}
