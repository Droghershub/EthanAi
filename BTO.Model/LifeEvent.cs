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
    [Table("life_events")]
    public class LifeEvent : Entity<int>
    {
        public LifeEvent()
        {
            value = 0;
            starting_age = 0;
            transaction_tax = 0;
            transaction_cost = 0;
            yearly_cost_reduction = 0;
            existant = false;


            is_absolute_lifeevent_transaction_tax = false;
            is_absolute_lifeevent_transaction_cost = false;
            is_absolute_lifeevent_yearly_cost = false;       

        }
        public LifeEvent(LifeEvent ev)
        {
            this.dream_id = ev.dream_id;
            this.dream_type_id = ev.dream_type_id;
            this.name = ev.name;
            this.starting_age = ev.starting_age;
            this.starting_year = ev.starting_year;
            this.transaction_cost = ev.transaction_cost;
            this.transaction_tax = ev.transaction_tax;
            this.value = ev.value;
            this.yearly_cost_reduction = ev.yearly_cost_reduction;
            this.ranking_index = ev.ranking_index;
            this.existant = ev.existant;
            this.age_dependent = ev.age_dependent;

            this.is_absolute_lifeevent_transaction_tax = ev.is_absolute_lifeevent_transaction_tax;
            this.is_absolute_lifeevent_transaction_cost = ev.is_absolute_lifeevent_transaction_cost;
            this.is_absolute_lifeevent_yearly_cost = ev.is_absolute_lifeevent_yearly_cost;      

        }
        public int dream_type_id { get; set; }
        public int persona_plan_id { get; set; }
        public Nullable<int> dream_id { get; set; }
        public string name { get; set; }
        public Nullable<decimal> value { get; set; }
        public int starting_age { get; set; }
        public Nullable<decimal> transaction_tax { get; set; }        
        public Nullable<decimal> transaction_cost { get; set; }
        public Nullable<decimal> yearly_cost_reduction { get; set; }
        public Nullable<bool> existant { get; set; }
        public string photo_path { get; set; }
        public string dependent_reference { get; set; }


        public bool is_absolute_lifeevent_transaction_tax { get; set; }
        public bool is_absolute_lifeevent_transaction_cost { get; set; }
        public bool is_absolute_lifeevent_yearly_cost { get; set; }

  
        [NotMapped]
        public int? age_dependent { get; set; }

        [NotMapped]
        public int starting_year { get; set; }

        [NotMapped]
        public int ranking_index { get; set; }
        [NotMapped]
        public string photoContent { get; set; }

        [ForeignKey("dream_type_id")]
        public virtual DreamType dream_type { get; set; }

        [ForeignKey("persona_plan_id")]
        public virtual PersonaPlan persona_plan { get; set; }
                
    }
}
