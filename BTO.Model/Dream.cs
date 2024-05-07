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
    [Table("dreams")]
    public class Dream : Entity<int>
    {
        public Dream()
        {
            purchase_age = 0;
            total_cost = 0;
            down_payment = 0;
            payment_duration = 1;
            mortage_interest_rate = 0;
            rental_net_income = 0;
            yearly_expenses = 0;
            transaction_cost = 0;
            existant = false;
            is_rent = false;
            is_living = false;

            is_absolute_dream_down_payment = false;
            is_absolute_dream_transaction_cost = false;
            is_absolute_dream_yearly_expenses = false;
            is_absolute_dream_rental_net_income = false;        
            


        //    remaining_debt = 0;
        }
        public Dream(Dream dr)
        {
            this.name = dr.name;
            this.purchase_age = dr.purchase_age;
            this.total_cost = dr.total_cost;
            this.down_payment = dr.down_payment;
            this.payment_duration = dr.payment_duration;
            this.mortage_interest_rate = dr.mortage_interest_rate;
            this.rental_net_income = dr.rental_net_income;
            this.yearly_expenses = dr.yearly_expenses;
            this.dream_type_id = dr.dream_type_id;
            this.transaction_cost = dr.transaction_cost;
            this.existant = dr.existant;
          //  this.remaining_debt = dr.remaining_debt;
            this.ranking_index = dr.ranking_index;
            this.is_rent = dr.is_rent;
            this.is_living = dr.is_living;
            this.residential_type = dr.residential_type;

            this.is_absolute_dream_down_payment = dr.is_absolute_dream_down_payment;
            this.is_absolute_dream_transaction_cost = dr.is_absolute_dream_transaction_cost;
            this.is_absolute_dream_yearly_expenses = dr.is_absolute_dream_yearly_expenses;
            this.is_absolute_dream_rental_net_income = dr.is_absolute_dream_rental_net_income;

      

        }
        public int dream_type_id { get; set; }
        public int persona_plan_id { get; set; }
        public int purchase_age { get; set; }
        public string name { get; set; }
        public Nullable<decimal> total_cost { get; set; }
        public Nullable<decimal> down_payment { get; set; }
        public Nullable<decimal> payment_duration { get; set; }
        public decimal mortage_interest_rate { get; set; }
        public Nullable<decimal> rental_net_income { get; set; }
        public Nullable<decimal> yearly_expenses { get; set; }
        public Nullable<decimal> transaction_cost { get; set; }
        public Nullable<bool> existant { get; set; }
        public string photo_path { get; set; }
        public bool is_rent { get; set; }
        public bool is_living { get; set; }


        public bool is_absolute_dream_down_payment { get; set; }
        public bool is_absolute_dream_transaction_cost { get; set; }
        public bool is_absolute_dream_yearly_expenses { get; set; }
        public bool is_absolute_dream_rental_net_income { get; set; }

   

        public Nullable<int> residential_type { get; set; }
        public string dependent_reference { get; set; }
       // public Nullable<decimal> remaining_debt { get; set; }
        [NotMapped]
        public int purchase_year { get; set; }

        [NotMapped]
        public int sell_year { get; set; }

        [NotMapped]
        public int sell_age { get; set; }

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
