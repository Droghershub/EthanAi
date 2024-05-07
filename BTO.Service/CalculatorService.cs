using BTO.Model;
using BTO.Service.Component;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service
{
    public class CalculatorService:ICalculatorService
    {
       
        PersonaInfo personaInfo;
        List<AgeResult> lsAgeResult;
        public HashSet<BaseObject> objectList;
        PeriodResult periodResult;
        private void Init(PersonaPlan personaPlan)
        {

            lsAgeResult = new List<AgeResult>();
            personaInfo = new PersonaInfo(personaPlan);
            Salary salary = new Salary(personaInfo);
            SocialSecurity socialSecurity = new SocialSecurity(personaInfo);
            ExpenseBeforeRetirement expenseBeforeRetirement = new ExpenseBeforeRetirement(personaInfo);
            ExpenseAfterRetirement expenseAfterRetirement = new ExpenseAfterRetirement(personaInfo);
            objectList = new HashSet<BaseObject>();
            objectList.Add(salary);
            objectList.Add(socialSecurity);
            objectList.Add(expenseBeforeRetirement);
            objectList.Add(expenseAfterRetirement);
            foreach (LifeEvent life in personaPlan.lifeEvent.Where(x=>x != null && x.existant != true))
            {
                switch (life.dream_type_id)
                {
                    case 4://residence sale
                        if (life.dream_id != null && life.dream_id > 0)
                        {
                            Dream dr = personaPlan.dreams.Where(t => t.id == life.dream_id).FirstOrDefault();
                            if (dr != null)
                            {
                                dr.sell_age = life.starting_age;
                                
                                ResidenceSale sale = new ResidenceSale(personaInfo, life, dr);
                                objectList.Add(sale);
                            }
                            else
                            {
                                ResidenceSale rSale = new ResidenceSale(personaInfo, life);
                                objectList.Add(rSale);
                            }
                        }
                        else
                        {
                            ResidenceSale rSale = new ResidenceSale(personaInfo, life);
                            objectList.Add(rSale);
                        }
                        break;
                    case 5: // child independent
                        ChildrenIndependent childIndepent = new ChildrenIndependent(personaInfo, life);
                        objectList.Add(childIndepent);
                        break;
                    case 6:
                        ExceptionalIncome eIncome = new ExceptionalIncome(personaInfo, life);
                        objectList.Add(eIncome);
                        break;
                    default:
                        break;
                }

            }
            foreach (Dream dream in personaPlan.dreams.Where(x => x.existant != true))
            {
                switch (dream.dream_type_id)
                {
                    case 1:
                        LifeEvent life_event = personaPlan.lifeEvent.Where(t => t!= null && t.dream_id == dream.id).FirstOrDefault();
                        if(life_event != null)
                            dream.sell_age = life_event.starting_age;

                        BaseObject residencePurchase = new ResidencePurchase(personaInfo, dream);
                        

                        objectList.Add(residencePurchase);
                        break;
                    case 2:
                        BaseObject education = new Education(personaInfo, dream);
                        objectList.Add(education);
                        break;
                    case 3:
                        BaseObject eExpense = new ExceptionalExpense(personaInfo, dream);
                        objectList.Add(eExpense);
                        break;
                    default:
                        break;
                }

            }
        }
        private void Calculate(PersonaPlan personaPlan)
        {            
            Init(personaPlan);
            periodResult = new PeriodResult(this.personaInfo, this.objectList);
            periodResult.Calculate();                       
        }
        public MainResult CalculatorBasic(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            Init(personaPlan);
            periodResult = new PeriodResult(this.personaInfo, this.objectList);
            periodResult.Calculate();
            MainResult result = periodResult.getMainResult();
            result.processing_time = (int)((DateTime.Now - begin).TotalMilliseconds);
            return result;            
        }
        public object CalculateAll(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            Init(personaPlan);
            periodResult = new PeriodResult(this.personaInfo, this.objectList);
            periodResult.Calculate();
            MainResult mainResult = periodResult.getMainResult();
            mainResult.processing_time = (int)((DateTime.Now - begin).TotalMilliseconds);
            var result = new
            {
                basic = mainResult,
                income_from_salary = periodResult.getPeriodSalary(),
                income_from_social_security = periodResult.getPeriodSocialSecurity(),
                income_from_investment = periodResult.getPeriodIncomeFromInvestment(),
                exceptional_incomes = periodResult.getPeriodExceptionalIncome(),
                recurring_incomes = periodResult.getPeriodRecurringIncome(),
                other_income = periodResult.getPeriodOtherIncome(),
                expenses_prior_retirement = periodResult.getPeriodExpenseBeforeRetirement(),
                saving = periodResult.getPeriodSavingBeforeRetirement(),
                saving_at_retirement = periodResult.getPeriodSavingAfterRetirement(),
                insufficient_funds = periodResult.getPeriodExceptionalExpense(),
                recurring_expense = periodResult.getPeriodRecurringExpense(),
                expenses_at_retirement = periodResult.getPeriodExpenseAfterRetirement(),
                top_equity_curve = periodResult.getTopEquityCurve(),
                bottom_equity_curve = periodResult.getBottomEquityCurve(),
                average_equity_curve = periodResult.getMediumEquityCurve(),
                zero_return = periodResult.getZeroEquityCurve(),
                illiquid_asset = periodResult.getPeriodAssetValue(),
                net_equity = periodResult.getPeriodNetEquityValue()
            };
            return result;
        }
        public object CalculateIncomeExpense(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            Init(personaPlan);
            periodResult = new PeriodResult(this.personaInfo, this.objectList);
            periodResult.Calculate();
            MainResult mainResult = periodResult.getMainResult();
            mainResult.processing_time = (int)((DateTime.Now - begin).TotalMilliseconds);
            var result = new
            {
                basic = mainResult,
                income_from_salary = periodResult.getPeriodSalary(),
                income_from_social_security = periodResult.getPeriodSocialSecurity(),
                income_from_investment = periodResult.getPeriodIncomeFromInvestment(),
                exceptional_incomes = periodResult.getPeriodExceptionalIncome(),
                recurring_incomes = periodResult.getPeriodRecurringIncome(),
                other_income = periodResult.getPeriodOtherIncome(),
                expenses_prior_retirement = periodResult.getPeriodExpenseBeforeRetirement(),
                saving = periodResult.getPeriodSavingBeforeRetirement(),
                saving_at_retirement = periodResult.getPeriodSavingAfterRetirement(),
                insufficient_funds = periodResult.getPeriodExceptionalExpense(),
                recurring_expense = periodResult.getPeriodRecurringExpense(),
                expenses_at_retirement = periodResult.getPeriodExpenseAfterRetirement()
            };
            return result;
        }
        public object CalculateEquityCurve(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            Init(personaPlan);
            periodResult = new PeriodResult(this.personaInfo, this.objectList);
            periodResult.Calculate();
            MainResult mainResult = periodResult.getMainResult();
            mainResult.processing_time = (int)((DateTime.Now - begin).TotalMilliseconds);
            var result = new
            {
                basic = mainResult,
                top_equity_curve = periodResult.getTopEquityCurve(),
                bottom_equity_curve =periodResult.getBottomEquityCurve(),
                average_equity_curve = periodResult.getMediumEquityCurve(),
                zero_return = periodResult.getZeroEquityCurve()

            };
            return result;
        }
        public object CalculateIlliquidCurve(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            Init(personaPlan);
            periodResult = new PeriodResult(this.personaInfo, this.objectList);
            periodResult.Calculate();
            MainResult mainResult = periodResult.getMainResult();
            mainResult.processing_time = (int)((DateTime.Now - begin).TotalMilliseconds);
            var result = new
            {
               basic = mainResult,
               illiquid_asset = periodResult.getPeriodAssetValue(),
               net_equity = periodResult.getPeriodNetEquityValue()
            };
            return result;
        }

        public string[] CalculateRanking(PersonaPlan personaPlan)
        {
            string[] result = null;
            Dictionary<int, object> objects = new Dictionary<int, object>();
            foreach (Dream dream in personaPlan.dreams)
            {
                dynamic analyticObject = new { dreamtype = "dream", dream = dream};
                objects.Add(dream.ranking_index, analyticObject);
            }
            foreach (LifeEvent lifeEvent in personaPlan.lifeEvent)
            {
                dynamic analyticObject = new { dreamtype = "lifeEvent", dream = lifeEvent };
                objects.Add(lifeEvent.ranking_index, analyticObject);
            }

            int total_object = personaPlan.dreams.Count + personaPlan.lifeEvent.Count + 1;

            result = new string[total_object];
            
            for (int i = total_object-1; i >= 0;i-- )
            {
                Init(personaPlan);
                PeriodResult periodResult = new PeriodResult(this.personaInfo, this.objectList);
                periodResult.Calculate();
                MainResult mainResult = periodResult.getMainResult();
                result[i] = mainResult.broken_age == null ? "0" : mainResult.broken_age.ToString();

                if (objects.ContainsKey(i))
                {                    
                    dynamic item = objects[i];
                    if (item.dreamtype == "dream")
                    {
                        personaPlan.dreams.Remove(item.dream);
                    }
                    else if (item.dreamtype == "lifeEvent")
                    {
                        personaPlan.lifeEvent.Remove(item.dream);
                    }
                }              
            }           

            return result;
        }
    }
}
