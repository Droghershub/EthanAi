using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace BTO.Model.Tracking
{
    // [DataContract(Name = "PersonalPlanModel", Namespace = "")]

    public class ScenarioModel
    {
        public ICollection<PersonalPlanModel> PersonalPlanModel { get; set; }
        public ScenarioModel()
        {
            PersonalPlanModel = new List<PersonalPlanModel>();
        }
    }
    public class PersonalPlanModel
    {
        public int Id { get; set; }
        public System.Guid UserId { get; set; }
        public int retirement_lifestyle { get; set; }
        public decimal IncomeToday { get; set; }
        public decimal ExpenseToday { get; set; }
        public decimal CurrentSaving { get; set; }
        public decimal Inflation { get; set; }
        public decimal SalaryEvolution { get; set; }
        public int StartAge { get; set; }
        public int StartYear { get; set; }
        public int RetirementAge { get; set; }
        public int SocialSecurityAge { get; set; }
        public int DeathAge { get; set; }

        public decimal ExpenseAtRetirement { get; set; }
        public decimal SocialSecurityPercent { get; set; }
        public decimal BottomValue { get; set; }
        public double RiskReturn { get; set; }
        public double Volatility { get; set; }
        public DateTime CreateTime { get; set; }
        public string Name { get; set; }
        public Nullable<ScenarioType> Status { get; set; }
        public decimal McBottomValue { get; set; }
        public decimal McTopValue { get; set; }
        public int NumberTrials { get; set; }
        public string CurrencyCode { get; set; }

        [XmlArray]
        //  [DataMember(Name = "DreamList", Order = 1)]
        public List<DreamModel> DreamList { get; set; }
        //  [DataMember(Name = "LifeEventList", Order = 2)]
        [XmlArray]
        public List<LifeEventModel> LifeEventList { get; set; }


        public static PersonalPlanModel Copy(PersonaPlan data)
        {
            return new PersonalPlanModel()
            {
                Id = data.id,
                UserId = data.user_id,
                IncomeToday = (decimal)(data.income_today == null ? 0 : data.income_today),
                ExpenseToday = (decimal)(data.expense_today == null ? 0 : data.expense_today),
                CurrentSaving = (decimal)(data.current_saving == null ? 0 : data.current_saving),
                Inflation = (decimal)(data.inflation == null ? 0 : data.inflation),
                SalaryEvolution = (decimal)(data.salary_evolution == null ? 0 : data.salary_evolution),
                StartAge = (int)(data.start_age == null ? 0 : data.start_age),
                StartYear = (int)(data.start_year == null ? 0 : data.start_year),
                RetirementAge = (int)(data.retirement_age == null ? 0 : data.retirement_age),
                SocialSecurityAge = (int)(data.social_security_age == null ? 0 : data.social_security_age),
                DeathAge = (int)(data.death_age == null ? 0 : data.death_age),
                ExpenseAtRetirement = (decimal)(data.expense_at_retirement == null ? 0 : data.expense_at_retirement),
                SocialSecurityPercent = (decimal)(data.social_security_percent == null ? 0 : data.social_security_percent),
                BottomValue = (decimal)(data.mc_bottom_value == null ? 0 : data.mc_bottom_value),
                RiskReturn = (double)(data.risk_return == null ? 0 : data.risk_return),
                Volatility = (double)(data.volatility == null ? 0 : data.volatility),
                DreamList = DreamModel.GetList(data),
                LifeEventList = LifeEventModel.GetList(data),
                CreateTime = data.time_create,
                Name = data.name,
                Status = data.status,// == null) ? (ScenarioType?) null :  data.status,
                McBottomValue = (decimal)data.mc_bottom_value,
                McTopValue = (decimal)data.mc_top_value,
                NumberTrials = (int)data.number_trials,
                retirement_lifestyle = data.retirement_lifestyle,
                CurrencyCode = String.IsNullOrEmpty(data.currency_code) ? "SGD" : data.currency_code
            };
        }
        public static PersonaPlan ModelToPersonalPlan(PersonalPlanModel item)
        {
            return new PersonaPlan()
            {
                current_saving = item.CurrentSaving,
                death_age = item.DeathAge,
                expense_at_retirement = item.ExpenseAtRetirement,
                expense_today = item.ExpenseToday,
                //id
                income_today = item.IncomeToday,
                inflation = item.Inflation,
                //lifeEvent = item.LifeEventList
                mc_bottom_value = item.McBottomValue,
                mc_top_value = item.McTopValue,
                name = item.Name,
                number_trials = item.NumberTrials,
                retirement_age = item.RetirementAge,
                risk_return = (decimal)item.RiskReturn,
                salary_evolution = item.SalaryEvolution,
                social_security_age = item.SocialSecurityAge,
                social_security_percent = item.SocialSecurityPercent,
                start_age = item.StartAge,
                start_year = item.StartYear,
                status = item.Status,
                time_create = item.CreateTime,
                user_id = item.UserId,
                volatility = (decimal)item.Volatility,
                currency_code = String.IsNullOrEmpty(item.CurrencyCode) ? "SGD" : item.CurrencyCode,
                retirement_lifestyle = item.retirement_lifestyle,
                dreams = DreamModel.ModelToOject(item),
                lifeEvent = LifeEventModel.ModelToObject(item)
            };
        }

    }
    //  [CollectionDataContract(Name = "DreamModel", Namespace = "")]
    public class DreamModel
    {
        public int Id { get; set; }
        public int DreamTypeId { get; set; }
        public int PersonaPlanId { get; set; }
        public int PurchaseAge { get; set; }
        public string Name { get; set; }
        public decimal TotalCost { get; set; }
        public decimal DownPayment { get; set; }
        public decimal PaymentDuration { get; set; }
        public decimal MortageInterestRate { get; set; }
        public decimal RentalNetIncome { get; set; }
        public decimal YearlyExpenses { get; set; }
        public decimal TransactionCost { get; set; }
        public int PurchaseYear { get; set; }
        public int SellYear { get; set; }
        public int SellAge { get; set; }
        public bool existant { get; set; }
        public string photo_path { get; set; }
        public bool is_rent { get; set; }
        public bool is_living { get; set; }



        public bool is_absolute_dream_down_payment { get; set; }
        public bool is_absolute_dream_transaction_cost { get; set; }
        public bool is_absolute_dream_yearly_expenses { get; set; }
        public bool is_absolute_dream_rental_net_income { get; set; }



        public Nullable<int> residential_type { get; set; }
        public string dependent_reference { get; set; }
        public DreamTypeModel dreamType { get; set; }
        public static DreamModel Copy(Dream item)
        {
            DreamModel md = new DreamModel()
            {
                Id = item.id,
                DreamTypeId = item.dream_type_id,
                PersonaPlanId = item.persona_plan_id,
                PurchaseAge = item.purchase_age,
                Name = item.name,
                TotalCost = (decimal)(item.total_cost == null ? 0 : item.total_cost),
                DownPayment = (decimal)(item.down_payment == null ? 0 : item.down_payment),
                PaymentDuration = (decimal)(item.payment_duration == null ? 0 : item.payment_duration),
                MortageInterestRate = item.mortage_interest_rate,
                RentalNetIncome = (decimal)(item.rental_net_income == null ? 0 : item.rental_net_income),
                YearlyExpenses = (decimal)(item.yearly_expenses == null ? 0 : item.yearly_expenses),
                TransactionCost = (decimal)(item.transaction_cost == null ? 0 : item.transaction_cost),
                PurchaseYear = item.purchase_age,
                SellAge = item.sell_age,
                SellYear = item.sell_year,
                existant = item.existant == null ? false : (bool)item.existant,
                photo_path = item.photo_path,
                is_rent = item.is_rent,
                is_living = item.is_living,

                is_absolute_dream_down_payment = item.is_absolute_dream_down_payment,
                is_absolute_dream_transaction_cost = item.is_absolute_dream_transaction_cost,
                is_absolute_dream_yearly_expenses = item.is_absolute_dream_yearly_expenses,
                is_absolute_dream_rental_net_income = item.is_absolute_dream_rental_net_income,


              
                residential_type = item.residential_type == null ? 0 : (int)item.residential_type,
                dependent_reference = item.dependent_reference,

                dreamType = DreamTypeModel.GetObject(item.dream_type)
            };
            return md;
        }
        public static Dream getObject(DreamModel item)
        {
            return new Dream()
            {
                id = item.Id,
                dream_type_id = item.DreamTypeId,
                persona_plan_id = item.PersonaPlanId,
                purchase_age = item.PurchaseAge,
                name = item.Name,
                total_cost = item.TotalCost,
                down_payment = item.DownPayment,
                payment_duration = item.PaymentDuration,
                mortage_interest_rate = item.MortageInterestRate,
                rental_net_income = item.RentalNetIncome,
                yearly_expenses = item.YearlyExpenses,
                transaction_cost = item.TransactionCost,
                purchase_year = item.PurchaseYear,
                sell_age = item.SellAge,
                sell_year = item.SellYear,
                existant = item.existant,
                photo_path = item.photo_path,
                is_rent = item.is_rent,
                is_living = item.is_living,

                is_absolute_dream_down_payment = item.is_absolute_dream_down_payment,
                is_absolute_dream_transaction_cost = item.is_absolute_dream_transaction_cost,
                is_absolute_dream_yearly_expenses = item.is_absolute_dream_yearly_expenses,
                is_absolute_dream_rental_net_income = item.is_absolute_dream_rental_net_income,

                residential_type = item.residential_type,
                dependent_reference = item.dependent_reference,
                dream_type = DreamTypeModel.ModelToObject(item.dreamType)

            };
        }
        internal static List<DreamModel> GetList(PersonaPlan data)
        {
            List<DreamModel> dreams = new List<DreamModel>();
            
            foreach (Dream item in data.dreams)
            {
                dreams.Add(new DreamModel()
                {
                    Id = item.id,
                    DreamTypeId = item.dream_type_id,
                    PersonaPlanId = item.persona_plan_id,
                    PurchaseAge = item.purchase_age,
                    Name = item.name,
                    TotalCost = (decimal)(item.total_cost == null ? 0 : item.total_cost),
                    DownPayment = (decimal)(item.down_payment == null ? 0 : item.down_payment),
                    PaymentDuration = (decimal)(item.payment_duration == null ? 0 : item.payment_duration),
                    MortageInterestRate = item.mortage_interest_rate,
                    RentalNetIncome = (decimal)(item.rental_net_income == null ? 0 : item.rental_net_income),
                    YearlyExpenses = (decimal)(item.yearly_expenses == null ? 0 : item.yearly_expenses),
                    TransactionCost = (decimal)(item.transaction_cost == null ? 0 : item.transaction_cost),
                    PurchaseYear = item.purchase_age,
                    SellAge = item.sell_age,
                    SellYear = item.sell_year,
                    existant = item.existant == null ? false : (bool)item.existant,
                    photo_path = item.photo_path,
                    is_rent = item.is_rent,
                    is_living = item.is_living,

                    is_absolute_dream_down_payment = item.is_absolute_dream_down_payment,
                    is_absolute_dream_transaction_cost = item.is_absolute_dream_transaction_cost,
                    is_absolute_dream_yearly_expenses = item.is_absolute_dream_yearly_expenses,
                    is_absolute_dream_rental_net_income = item.is_absolute_dream_rental_net_income,



                    residential_type = item.residential_type == null ? 0 : (int)item.residential_type,
                    dependent_reference = item.dependent_reference,
                    dreamType = DreamTypeModel.GetObject(item.dream_type)
                });
            }
            return dreams;
        }

        internal static ICollection<Dream> ModelToOject(PersonalPlanModel items)
        {
            ICollection<Dream> dreams = new List<Dream>();
            foreach (var item in items.DreamList)
            {
                dreams.Add(new Dream()
                {
                    id = item.Id,
                    down_payment = item.DownPayment,
                    dream_type_id = item.DreamTypeId,
                    mortage_interest_rate = item.MortageInterestRate,
                    name = item.Name,
                    payment_duration = item.PaymentDuration,
                    persona_plan_id = item.PersonaPlanId,
                    purchase_age = item.PurchaseAge,
                    purchase_year = item.PurchaseYear,
                    rental_net_income = item.RentalNetIncome,
                    sell_age = item.SellAge,
                    sell_year = item.SellYear,
                    total_cost = item.TotalCost,
                    transaction_cost = item.TransactionCost,
                    yearly_expenses = item.YearlyExpenses,
                    existant = item.existant,
                    photo_path = item.photo_path,
                    is_rent = item.is_rent,
                    is_living = item.is_living,

                    is_absolute_dream_down_payment = item.is_absolute_dream_down_payment,
                    is_absolute_dream_transaction_cost = item.is_absolute_dream_transaction_cost,
                    is_absolute_dream_yearly_expenses = item.is_absolute_dream_yearly_expenses,
                    is_absolute_dream_rental_net_income = item.is_absolute_dream_rental_net_income,


                   
                    residential_type = item.residential_type,
                    dependent_reference = item.dependent_reference,
                    dream_type = DreamTypeModel.ModelToObject(item.dreamType)
                });
            }
            return dreams;
        }
    }
    //   [CollectionDataContract(Name = "LifeEventModel", ItemName = "LifeEvent", Namespace = "")]
    public class LifeEventModel
    {
        public int Id { get; set; }
        public int DreamTypeId { get; set; }
        public int PersonaPlanId { get; set; }
        public int DreamId { get; set; }
        public string Name { get; set; }
        public decimal Value { get; set; }
        public int StartingAge { get; set; }
        public int StartingYear { get; set; }
        public decimal TransactionTax { get; set; }
        public decimal TransactionCost { get; set; }
        public decimal YearlyCostReduction { get; set; }
        public bool existant { get; set; }

      
        public bool is_absolute_lifeevent_transaction_tax { get; set; }
        public bool is_absolute_lifeevent_transaction_cost { get; set; }
        public bool is_absolute_lifeevent_yearly_cost { get; set; }

   
        public string photo_path { get; set; }
        public string dependent_reference { get; set; }
        public DreamTypeModel dreamType { get; set; }
        public static LifeEventModel Copy(LifeEvent item)
        {
            return new LifeEventModel()
            {
                Id = item.id,
                DreamTypeId = item.dream_type_id,
                PersonaPlanId = item.persona_plan_id,
                DreamId = (int)(item.dream_id == null ? 0 : item.dream_id),
                Name = item.name,
                Value = (decimal)(item.value == null ? 0 : item.value),
                StartingAge = item.starting_age,
                StartingYear = item.starting_year,
                TransactionCost = (decimal)(item.transaction_cost == null ? 0 : item.transaction_cost),
                TransactionTax = (decimal)(item.transaction_tax == null ? 0 : item.transaction_tax),
                YearlyCostReduction = (decimal)(item.yearly_cost_reduction == null ? 0 : item.yearly_cost_reduction),
                existant = item.existant == null ? false : (bool)item.existant,
                photo_path = item.photo_path,

                is_absolute_lifeevent_transaction_tax = item.is_absolute_lifeevent_transaction_tax,
                is_absolute_lifeevent_transaction_cost = item.is_absolute_lifeevent_transaction_cost,
                is_absolute_lifeevent_yearly_cost = item.is_absolute_lifeevent_yearly_cost,

                dependent_reference = item.dependent_reference,
                dreamType = DreamTypeModel.GetObject(item.dream_type)
            };
        }
        public static LifeEvent getObject(LifeEventModel item)
        {
            return new LifeEvent()
            {
                id = item.Id,
                dream_type_id = item.DreamTypeId,
                persona_plan_id = item.PersonaPlanId,
                dream_id = item.DreamId,
                name = item.Name,
                value = item.Value,
                starting_age = item.StartingAge,
                starting_year = item.StartingYear,
                transaction_cost = item.TransactionCost,
                transaction_tax = item.TransactionTax,
                yearly_cost_reduction = item.YearlyCostReduction,
                existant = item.existant,
                photo_path = item.photo_path,
                dependent_reference = item.dependent_reference,
                dream_type = DreamTypeModel.ModelToObject(item.dreamType),

               
                is_absolute_lifeevent_transaction_tax = item.is_absolute_lifeevent_transaction_tax,
                is_absolute_lifeevent_transaction_cost = item.is_absolute_lifeevent_transaction_cost,
                is_absolute_lifeevent_yearly_cost = item.is_absolute_lifeevent_yearly_cost,
             

            };
        }
        internal static List<LifeEventModel> GetList(PersonaPlan data)
        {
            List<LifeEventModel> lifeEvents = new List<LifeEventModel>();
            foreach (LifeEvent item in data.lifeEvent)
            {
                lifeEvents.Add(new LifeEventModel()
                {
                    Id = item.id,
                    DreamTypeId = item.dream_type_id,
                    PersonaPlanId = item.persona_plan_id,
                    DreamId = (int)(item.dream_id == null ? 0 : item.dream_id),
                    Name = item.name,
                    Value = (decimal)(item.value == null ? 0 : item.value),
                    StartingAge = item.starting_age,
                    StartingYear = item.starting_year,
                    TransactionCost = (decimal)(item.transaction_cost == null ? 0 : item.transaction_cost),
                    TransactionTax = (decimal)(item.transaction_tax == null ? 0 : item.transaction_tax),
                    YearlyCostReduction = (decimal)(item.yearly_cost_reduction == null ? 0 : item.yearly_cost_reduction),
                    existant = item.existant == null ? false : (bool)item.existant,
                    photo_path = item.photo_path,
                    dependent_reference = item.dependent_reference,
                    dreamType = DreamTypeModel.GetObject(item.dream_type),


                    is_absolute_lifeevent_transaction_tax = item.is_absolute_lifeevent_transaction_tax,
                    is_absolute_lifeevent_transaction_cost = item.is_absolute_lifeevent_transaction_cost,
                    is_absolute_lifeevent_yearly_cost = item.is_absolute_lifeevent_yearly_cost
                  
                });
            }
            return lifeEvents;
        }

        internal static ICollection<LifeEvent> ModelToObject(PersonalPlanModel items)
        {
            ICollection<LifeEvent> lifevents = new List<LifeEvent>();
            foreach (var item in items.LifeEventList)
            {
                lifevents.Add(new LifeEvent()
                {
                    id = item.Id,
                    dream_id = item.DreamId,
                    dream_type_id = item.DreamTypeId,
                    name = item.Name,
                    persona_plan_id = item.PersonaPlanId,
                    starting_age = item.StartingAge,
                    starting_year = item.StartingYear,
                    transaction_cost = item.TransactionCost,
                    transaction_tax = item.TransactionTax,
                    value = item.Value,
                    yearly_cost_reduction = item.YearlyCostReduction,
                    existant = item.existant,
                    photo_path = item.photo_path,
                    dependent_reference = item.dependent_reference,
                    dream_type = DreamTypeModel.ModelToObject(item.dreamType),

                    is_absolute_lifeevent_transaction_tax = item.is_absolute_lifeevent_transaction_tax,
                    is_absolute_lifeevent_transaction_cost = item.is_absolute_lifeevent_transaction_cost,
                    is_absolute_lifeevent_yearly_cost = item.is_absolute_lifeevent_yearly_cost,
                   
                });
            }
            return lifevents;
        }
    }
    public class DreamTypeModel
    {

        public string dream_name { get; set; }
        public string image_name { get; set; }

        public Nullable<bool> is_liquid { get; set; }

        public string type { get; set; }
        internal static DreamTypeModel GetObject(DreamType item)
        {
            if (item == null)
                return null;
            return new DreamTypeModel()
            {
                dream_name = item.dream_name,
                image_name = item.image_name,
                is_liquid = item.is_liquid,
                type = item.type
            };
        }
        internal static DreamType ModelToObject(DreamTypeModel item)
        {
            if (item == null)
                return null;
            return new DreamType()
            {
                dream_name = item.dream_name,
                image_name = item.image_name,
                is_liquid = item.is_liquid,
                type = item.type
            };
        }
    }
    public class RankingDreams
    {
        public int age { get; set; }
        public int id { get; set; }
        public int index { get; set; }
        public string label { get; set; }
        public string name { get; set; }
        public string type { get; set; }
        public int year { get; set; }
        public static List<RankingDreams> GetListRanking(PersonaPlan data)
        {
            List<RankingDreams> list = new List<RankingDreams>();
            //first for retirement age            
            list.Add(new RankingDreams()
            {
                age = data.retirement_age == null ? 0 : (int)data.retirement_age,
                id = 0,
                index = 0,
                label = "Retirement in {{year}}",
                name = "Retirement",
                type = "Retirement",
                year = data.retirement_age == null ? 0 : (int)data.retirement_age
            });
            //for dreams list
            foreach (Dream item in data.dreams)
            {
                list.Add(new RankingDreams()
                    {
                        age = item.purchase_age,
                        id = item.id,
                        index = item.ranking_index,
                        label = "{{name}} in {{year}}",
                        name = item.name,
                        type = "dream",
                        year = item.purchase_age

                    });
            }
            foreach (LifeEvent item in data.lifeEvent)
            {
                list.Add(new RankingDreams()
                {
                    age = item.starting_age,
                    id = item.id,
                    index = item.ranking_index,
                    label = "{{name}} in {{year}}",
                    name = item.name,
                    type = "lifeevent",
                    year = item.starting_age

                });
            }
            return list;
        }
    }
    public class LoadSessionModel
    {
        public PersonalPlanModel PersonalPlanModel { get; set; }
        public UserProfileModel UserProfile { get; set; }
        public List<Persona> ListPersona { get; set; }

    }
    public class ChildModel
    {
        public int id { get; set; }
        public string full_name { get; set; }
        public int age { get; set; }
        internal static List<ChildModel> GetList(UserProfile profile)
        {
            List<ChildModel> list = new List<ChildModel>();
            foreach (UserProfileDependent depentdent in profile.dependent)
            {
                if (depentdent.relationship == null || depentdent.relationship == 0)
                {
                    list.Add(new ChildModel() { id = depentdent.id, full_name = depentdent.full_name, age = depentdent.age });
                }
            }
            return list;
        }
    }
    public class UserProfileModel
    {
        public string first_name { get; set; }
        public int age { get; set; }
        public int married_status { get; set; }
        public string spouse_first_name { get; set; }
        public int spouse_age { get; set; }
        public int occupation { get; set; }
        [XmlArray]
        public List<ChildModel> childs { get; set; }
        public static UserProfileModel GetFromUserProfile(UserProfile profile)
        {
            UserProfileModel model = new UserProfileModel();
            model.first_name = profile.first_name;
            model.age = profile.age;
            model.married_status = profile.married_status;
            model.spouse_first_name = profile.spouse_first_name;
            model.spouse_age = profile.spouse_age;
            model.occupation = profile.occupation;
            model.childs = ChildModel.GetList(profile);

            return model;
        }
    }
}
