using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Common
{
    public class Formula
    {
        public static double ComputeAnnity(double i, int n, double pv)
        { // to compute annity

            if (i == 0) return pv / n; else return 12 * (pv * i / 12) / (1 - Math.Pow(1 + i/ 12, -n * 12));
        }
        public static double Mortage(double total_cost,double down_payment,double duration,double inflation,int purchase_age,int age,int starting_age)
        {            
            return (1-down_payment)*total_cost*Math.Pow(1+inflation,purchase_age-starting_age)*(1-((age -purchase_age)/(double)(duration-1)));            
        }
        public static double Interest(double total_cost, double interest_rate, double down_payment, double duration, double inflation, int purchase_age, int age, int starting_age)
        {
            double mortageRemaining = Formula.Mortage(total_cost, down_payment, duration, inflation, purchase_age, age-1, starting_age);
            return mortageRemaining * interest_rate + (1 - down_payment) * total_cost * Math.Pow(1 + inflation, purchase_age - starting_age) * (1 / (double)(duration - 1));
            //return (1 - down_payment) * total_cost * interest_rate * Math.Pow(1 + inflation, age - purchase_age) * ((age - purchase_age) / (double)(duration - 1));
        }

    }
}
