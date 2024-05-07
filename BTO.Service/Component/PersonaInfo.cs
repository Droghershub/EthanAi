using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
namespace BTO.Service
{
    public class PersonaInfo
    {
        private int period;
        private int starting_age;
        private int ending_age;
        private int retirement_age;
        private int social_security_age ;
        private double salary_income;
        private double expense_before_retirement;
        private double liquid_assets;

        private double expense_after_retirement;
        private double risk_return;
        private double volatility;
        private int number_trials;
        private double inflation;
        private double salary_increase;
        private double top;
        private double bottom;
        public PersonaInfo()
        {
        }

        public PersonaInfo(PersonaPlan personaPlan)
        {
            this.StartingAge = (int)personaPlan.start_age;
            this.EndingAge = (int)personaPlan.death_age;
            this.Period = this.EndingAge - this.StartingAge + 1;
            this.RetirementAge = (int)personaPlan.retirement_age;
            this.social_security_age = (int)personaPlan.social_security_age;// personaPlan.social_security_age == null ? 0 : (int)personaPlan.social_security_age;
            this.SalaryIncome = personaPlan.income_today == null ? 0 : (double)personaPlan.income_today * 12;
            this.Inflation = personaPlan.inflation == null ? 0 : (double)personaPlan.inflation;
            this.SalaryIncreasement = personaPlan.salary_evolution == null ? 0 : (double)personaPlan.salary_evolution;
            this.RiskReturn = personaPlan.risk_return == null ? 0 : (double)personaPlan.risk_return;
            this.Volatility = personaPlan.volatility == null ? 0 : (double)personaPlan.volatility;
            this.NumberOfTrials = personaPlan.number_trials == null ? 5000 : (int)personaPlan.number_trials;                
            this.LiquidAsset = personaPlan.current_saving == null ? 0 : (double)personaPlan.current_saving;
            this.ExpenseBeforeRetirement = personaPlan.expense_today == null ? 0 : (double)personaPlan.expense_today * 12;
            this.ExpenseAfterRetirement = personaPlan.expense_at_retirement == null ? 0 : (double)personaPlan.expense_at_retirement * 12;
            this.Top = personaPlan.mc_top_value == null ? 0 : (double)personaPlan.mc_top_value;
            this.Bottom = personaPlan.mc_bottom_value == null ? 0 : (double)personaPlan.mc_bottom_value;
            //setting for social age = retirement age + 1 for temporary solution
         //  this.SocialSecurityAge = this.RetirementAge + 1>60?this.RetirementAge + 1: 60;
        }
        public int Period
        {
            get
            {
                return period;
            }
            set
            {
                if (value > 0)
                {
                    period = value;
                }
            }
        }

        public int StartingAge
        {
            get
            {
                return starting_age;
            }
            set
            {
                if (value > 0)
                {
                    starting_age = value;
                }
            }
        }
        public int EndingAge
        {
            get { return ending_age; }
            set
            {
                if (value > 0)
                {
                    ending_age = value;
                }
            }
        }
        public int RetirementAge
        {
            get
            {
                return retirement_age;
            }
            set
            {
                if (value > 0)
                {
                    retirement_age = value;
                }
            }
        }
        public double SalaryIncome
        {
            get
            {
                return salary_income;
            }
            set
            {
                if (value > 0)
                {
                    salary_income = value;
                }
            }
        }

        public double SalaryIncreasement
        {
            get
            {
                return salary_increase;
            }
            set
            {
                if (value > 0)
                {
                    salary_increase = value;
                }
            }
        }

        public int SocialSecurityAge
        {
            get
            {
                return social_security_age;
            }
            set
            {
                if (value > 0)
                {
                    social_security_age = value;
                }
            }
        }

        public double Inflation
        {
            get
            {
                return inflation;
            }
            set
            {
                if (value > 0)
                {
                    inflation = value;
                }
            }
        }

        public double ExpenseBeforeRetirement
        {
            get
            {
                return expense_before_retirement;
            }
            set
            {
                if (value > 0)
                {
                    expense_before_retirement = value;
                }
            }
        }

        public double ExpenseAfterRetirement
        {
            get
            {
                return expense_after_retirement;
            }
            set
            {
                if (value > 0)
                {
                    expense_after_retirement = value;
                }
            }
        }
        public int NumberOfTrials
        {
            get { return number_trials; }
            set
            {
                if(value>0)
                {
                    number_trials = value;
                }
            }
        }
        public double Volatility
        {
            get { return volatility; }
            set
            {
                if (value > 0)
                {
                    volatility = value;
                }
            }
        }
        public double RiskReturn
        {
            get { return risk_return; }
            set
            {
                if (value > 0)
                {
                    risk_return = value;
                }
            }
        }
        public double LiquidAsset
        {
            get { return liquid_assets; }
            set
            {
                if (value > 0)
                {
                    liquid_assets = value;
                }
            }
        }
        public double Top { get; set; }
        public double Bottom { get; set; }
    }
}
