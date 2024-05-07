using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
namespace BTO.Model
{
    [Table("persona_plan")]
    public class PersonaPlan : Entity<int>
    {
        public PersonaPlan():base()
        {
            this.dreams = new HashSet<Dream>();
            this.lifeEvent = new HashSet<LifeEvent>();
            retirement_lifestyle = -1;
        }
        public PersonaPlan(PersonaPlan personaPlan)
            : base()
        {
            this.dreams = new HashSet<Dream>();
            this.lifeEvent = new HashSet<LifeEvent>();

            this.income_today = personaPlan.income_today;
            this.expense_today = personaPlan.expense_today;
            this.current_saving = personaPlan.current_saving;
            this.inflation = personaPlan.inflation;
            this.salary_evolution = personaPlan.salary_evolution;
            this.start_age = personaPlan.start_age;
            this.start_year = personaPlan.start_year;
            this.retirement_age = personaPlan.retirement_age;
            this.social_security_age = personaPlan.social_security_age;
            this.death_age = personaPlan.death_age;
            this.expense_at_retirement = (personaPlan.expense_at_retirement != null ? personaPlan.expense_at_retirement : 0);
            this.social_security_percent = personaPlan.social_security_percent;
            this.volatility = personaPlan.volatility == null ? 0.16M : personaPlan.volatility;
            this.risk_return = personaPlan.risk_return == null ? 0.08M : personaPlan.risk_return;
            this.mc_bottom_value = personaPlan.mc_bottom_value;
            this.mc_top_value = personaPlan.mc_top_value;
            this.number_trials = personaPlan.number_trials;
            this.user_id = personaPlan.user_id;
            this.time_create = DateTime.Now;
            this.status = personaPlan.status;
            this.name = personaPlan.name;
            this.retirement_lifestyle = personaPlan.retirement_lifestyle;            
            foreach (Dream dr in personaPlan.dreams)
                this.dreams.Add(new Dream(dr));
            foreach (LifeEvent ev in personaPlan.lifeEvent)
                this.lifeEvent.Add(new LifeEvent(ev));
        }
        public System.Guid user_id { get; set; }
        public int retirement_lifestyle { get; set; }
        public Nullable<decimal> income_today { get; set; }
        public Nullable<decimal> expense_today { get; set; }
        public Nullable<decimal> current_saving { get; set; }
        public Nullable<decimal> inflation { get; set; }
        public Nullable<decimal> salary_evolution { get; set; }
        public Nullable<int> start_age { get; set; }
        public Nullable<int> start_year { get; set; }
        public Nullable<int> retirement_age { get; set; }
        public Nullable<int> social_security_age { get; set; } 
        public Nullable<int> death_age { get; set; }        
        public Nullable<decimal> expense_at_retirement { get; set; }
        public Nullable<decimal> social_security_percent { get; set; }
        public Nullable<decimal> mc_top_value { get; set; }
        public Nullable<decimal> mc_bottom_value { get; set; }
        public Nullable<int> number_trials { get; set; }
        public Nullable<decimal> risk_return { get; set; }
        public Nullable<decimal> volatility { get; set; }
        public string name { get; set; }
        public Nullable<ScenarioType> status { get; set; }
        
        
        public DateTime time_create { get; set; }
        public string currency_code { get; set; }
        public virtual ICollection<Dream> dreams { get; set; }
        public virtual ICollection<LifeEvent> lifeEvent { get; set; }
        [NotMapped]
        public Nullable<decimal> saving_today { get{return this.income_today-this.expense_today;} }
        /*[NotMapped]
        public string ClientActionType { get; set; }
        */
    }
}
