using BTO.Common;
using BTO.Model;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
namespace BTO.Service
{
    public class MainService : IMainService
    {
        PersonaPlan c_personaPlan;

        private static readonly int c_year = 2015;
        private static readonly int max_age = 99;

        private static double[] health_template = new double[120];
        private static string[] cost_categories = new string[] { "Home food", "Rental", "Utilities", "Transport", "Telecom", "Restaurant", "Coffee", "Leisure", "Smoking" };

        private int period;
        private int start_year;
        private int c_age;
        private int ret_age;
        private int social_security_age = 60; // moved to persona level instead of class level (LB's request)
        private int death_age; // horrible, but the customer does not see my code !
        private int bankrupt_age; // horrible too but reality
        private double c_income;
        private double c_savings;
        private double c_general_expenses;
        private double c_health_costs;

        private double c_liquid_assets;
        private double c_debt_charge;
        private int year_debt_charge;

        private double r_social_income;
        private double r_expenses;

        private double risk_return;
        private double volatility;
        private double inflation;
        private double salary_increase;
        private double income_tax;
        private double base_tax;
        private bool template_health;

        private int[] years;
        private double[] income;
        private double[] income_from_salary;
        private double[] income_from_investment;
        private double[] income_from_social_security;
        private double[] other_income;
        private double[] health_costs;
        private double[] expenses;
        private double[] expenses_prior_retirement;
        private double[] expenses_at_retirement;
        private double[] illiquid_asset;
        private double[] debt_charge;
        private double[] debt_value;
        private double[] cash_flows;
        private double[] opening;
        private double[] investment;
        private double[] risk_returns;
        private double[] disposal;
        private double[] taxes;
        private double[] equity_curve;
        private double[] top_equity_curve;
        private double[] bottom_equity_curve;
        private double[] average_equity_curve; // let's not use MC for average
        private double[] display_equity_curve;
        private double[] display_top_equity_curve;
        private double[] display_average_equity_curve; // let's not use MC for average
        private double[] display_bottom_equity_curve;

        private double[] debt_ratio;

        private int nb_trials;
        private double MC_top_value;
        private double MC_bottom_value;
        private bool MC_compute;
        private double[] trials;
        private double[] sorted_trials;

        ArrayList dreams = new ArrayList();

        public void Init(PersonaPlan personaPlan)
        {
            c_personaPlan = personaPlan;

            MC_top_value = (double)personaPlan.mc_top_value;
            MC_bottom_value = (double)personaPlan.mc_bottom_value;
            nb_trials = personaPlan.number_trials ?? 0;
            //Customize
            start_year = personaPlan.start_year ?? 0;
            c_age = personaPlan.start_age ?? 0;
            ret_age = personaPlan.retirement_age ?? 0;
            social_security_age = ret_age;
            death_age = personaPlan.death_age ?? 0;
            c_income = (double)(personaPlan.income_today ?? 0) * 12;
            c_liquid_assets = (double)(personaPlan.current_saving ?? 0);

            //expense_today split to 3 part: c_general_expenses, c_health_costs and c_debt_charge
            c_general_expenses = (double)(personaPlan.expense_today ?? 0) * 12;
            c_health_costs = (double)(personaPlan.expense_today ?? 0) * 12 - c_general_expenses;
            c_debt_charge = (double)(personaPlan.expense_today ?? 0) * 12 - c_general_expenses - c_debt_charge;

            r_social_income = 0;
            risk_return = personaPlan.risk_return;
            r_expenses = 0 - (double)(personaPlan.expense_at_retirement ?? 0) * 12;
            salary_increase = (double)(personaPlan.salary_evolution ?? 0);
            inflation = (double)(personaPlan.inflation ?? 0);
            income_tax = 0.2;
            base_tax = 0.5;
            year_debt_charge = 2018;
            volatility = personaPlan.volatility;
            template_health = false;
            //--------

            period = death_age - c_age + 1;

            years = new int[period];
            income = new double[period];
            income_from_salary = new double[period];
            income_from_investment = new double[period];
            income_from_social_security = new double[period];
            other_income = new double[period];
            health_costs = new double[period];
            expenses = new double[period];
            expenses_prior_retirement = new double[period];
            expenses_at_retirement = new double[period];
            illiquid_asset = new double[period];
            debt_charge = new double[period];
            debt_value = new double[period];
            cash_flows = new double[period];
            opening = new double[period];
            investment = new double[period];
            risk_returns = new double[period];
            disposal = new double[period];
            taxes = new double[period];
            equity_curve = new double[period];
            top_equity_curve = new double[period];
            average_equity_curve = new double[period];
            bottom_equity_curve = new double[period];
            display_equity_curve = new double[period];
            display_top_equity_curve = new double[period];
            display_average_equity_curve = new double[period];
            display_bottom_equity_curve = new double[period];
            debt_ratio = new double[period];

            trials = new double[nb_trials];
            sorted_trials = new double[nb_trials];

            int i;
            for (i = 0; i < 35; i++) health_template[i] = 0.0;
            for (i = 35; i < 41; i++) health_template[i] = 0.10;
            for (i = 41; i < 50; i++) health_template[i] = 0.15;
            for (i = 50; i < 56; i++) health_template[i] = 0.25;
            for (i = 56; i < 60; i++) health_template[i] = 0.35;
            for (i = 60; i < 66; i++) health_template[i] = 0.50;
            for (i = 66; i < 70; i++) health_template[i] = 1.0;
            for (i = 70; i < 76; i++) health_template[i] = 2.0;
            for (i = 76; i < 80; i++) health_template[i] = 3.0;
            for (i = 80; i < 85; i++) health_template[i] = 5.0;
            for (i = 85; i < 90; i++) health_template[i] = 6.0;
            for (i = 90; i < 120; i++) health_template[i] = 10.0;

            MC_compute = (MC_top_value != 0) || (MC_bottom_value != 0);
        }

        public static double efficient_frontier(double risk)
        {
            // compute the return given the risk
            // risk between 0 and 30%
            return (0.0233 * Math.Log(risk) + 0.1265); // Logarithm interpolation from LB007
        }

        public static double NormaleInverse(double fProb, double dMean, double dEcartType)
        {
            double NormaleInverse = Stats.getInvCDF(fProb, true);

            //if (NormaleInverse > -99 && NormaleInverse < 99)
            NormaleInverse = (NormaleInverse * dEcartType) + dMean;
            //End If
            return NormaleInverse;
        }

        public static double Percentile(double[] sequence, double excelPercentile)
        {
            //Arrays.sort(sequence); // done outside !
            int N = sequence.Length;
            double n = (N - 1) * excelPercentile + 1;
            //Another method: 
            //double n = (N + 1) * excelPercentile;
            if (n == 1d) return sequence[0];
            else if (n == N) return sequence[N - 1];
            else
            {
                int k = (int)n;
                double d = n - k;
                return sequence[k - 1] + d * (sequence[k] - sequence[k - 1]);
            }
        }

        // alternate percentile functions, not used in code
        public double Percentile2(double[] seq, double percentile)
        {
            //var elements=seq.ToArray();
            //Array.Sort(elements);
            double realIndex = percentile * (seq.Length - 1);
            int index = (int)realIndex;
            double frac = realIndex - index;
            if (index + 1 < seq.Length)
                return seq[index] * (1 - frac) + seq[index + 1] * frac;
            else
                return seq[index];
        }

        double excelPercentile(double[] data, double percentile)
        {
            //Arrays.sort(data);
            double index = percentile * (data.Length - 1);
            int lower = (int)Math.Floor(index);
            if (lower < 0)
            { // should never happen, but be defensive
                return data[0];
            }
            if (lower >= data.Length - 1)
            { // only in 100 percentile case, but be defensive
                return data[data.Length - 1];
            }
            double fraction = index - lower;
            // linear interpolation
            double result = data[lower] + fraction * (data[lower + 1] - data[lower]);
            return result;
        }

        private double pmt(double i, int n, double pv, int purchase_year)
        {
            // to compute annity          
            if (i == 0) return pv / n; else return 12 * (pv * i / 12) / (1 - Math.Pow(1 + i / 12, -n * 12));
        }


        public void Compute(PersonaPlan personaPlan)
        {
            Init(personaPlan);
            int i = 0;
            for (i = 0; i < period; i++) years[i] = i + c_year;

            for (i = 0; i < period; i++)
            {
                r_social_income = r_social_income * Math.Pow(1 + inflation, 1);
                if (i == Math.Min(social_security_age, ret_age) - c_age)
                {
                    r_social_income = c_income * Math.Pow(1 + salary_increase, i) * (double)personaPlan.social_security_percent;
                }                

                if (i > Math.Max(social_security_age, ret_age) - c_age)
                {                  
                    income[i] = r_social_income ; // modif 25/04/2015: no more 0 but social income, with normal inflation this time (26/04/2015)                    
                    income_from_social_security[i] = income[i];
                }
                else
                {
                    income_from_social_security[i] = 0;
                }
                if (i > (ret_age - c_age))
                {

                    income_from_salary[i] = 0;

                }
                else
                {
                    income[i] = c_income * Math.Pow(1 + salary_increase, i);
                    income_from_salary[i] = income[i];

                }
                if (template_health)
                {
                    health_costs[i] = -c_health_costs / (1 + health_template[c_age]) * (1 + health_template[c_age + i]);
                }
                else
                {
                    health_costs[i] = -c_health_costs * Math.Pow((1 + inflation), i);
                }
                if (years[i] <= year_debt_charge) debt_charge[i] = -c_debt_charge; else debt_charge[i] = 0;
                //if (i==0) expenses[i] = - income[i] + c_savings - health_costs[i] - debt_charge[i]; 
                //    else expenses[i] = expenses[i-1]*(1+inflation);
                // new way (5.2: dissociate expenses from income !
                if (i > (ret_age - c_age))
                {
                    expenses[i] = r_expenses * Math.Pow(1 + inflation, i); // modif 25/04/2015: at retirement spend everything; 
                    // so the health costs (already included in expenses) have to be adjusted by difference

                    expenses_at_retirement[i] = -(debt_charge[i] + expenses[i] + health_costs[i] - health_costs[0]);
                    expenses_prior_retirement[i] = 0;
                    cash_flows[i] = income[i] + debt_charge[i] + expenses[i] + health_costs[i] - health_costs[0];
                }
                else
                {
                    expenses[i] = -c_general_expenses * Math.Pow(1 + inflation, i);
                    expenses_at_retirement[i] = 0;
                    expenses_prior_retirement[i] = -(health_costs[i] + debt_charge[i] + expenses[i]);
                    cash_flows[i] = income[i] + health_costs[i] + debt_charge[i] + expenses[i];
                }



                // dreams

                other_income[i] = 0;
                if (i > 0)
                {
                    illiquid_asset[i] += illiquid_asset[i - 1] * Math.Pow((1 + inflation), 1);
                }
                foreach (Dream element in c_personaPlan.dreams)
                {
                    //If is house or education
                    if (element.dream_type_id == 3)
                    {
                        element.purchase_year = start_year + (element.purchase_age - c_age);
                        if (years[i] == element.purchase_year)
                        {
                            if (i > (ret_age - c_age))
                            {
                                expenses_at_retirement[i] += (double)element.total_cost;
                            }
                            else
                            {
                                expenses_prior_retirement[i] += (double)element.total_cost;
                            }
                            expenses[i] += -(double)element.total_cost;
                            cash_flows[i] -= (double)element.total_cost; 
                        }
                    }
                    
                    if (element.dream_type_id == 1 || element.dream_type_id == 2)
                    {
                        if (c_personaPlan.lifeEvent != null)
                            foreach (LifeEvent lifeEvent in c_personaPlan.lifeEvent)
                            {
                                if (lifeEvent.dream_id == element.id)
                                {
                                    element.sell_year = start_year + (lifeEvent.starting_age - c_age);
                                    break;
                                }
                            }
                        if (true)
                        {
                            element.purchase_year = start_year + (element.purchase_age - c_age);
                            decimal down_payment = (decimal)(element.down_payment * element.total_cost);

                            // only compute impact of dream if needed
                            // debug 25/05/2015: if personal contribution is < 0 is exceptional income, no annuity !!
                            double annuity = (down_payment < 0) ? 0 : pmt((double)element.mortage_interest_rate, (int)element.payment_duration, (double)element.total_cost - (double)down_payment, element.purchase_year); // new in 5.2: inflation ajusted
                            // new in 5.2: inflation adjusted                        

                            if (years[i] == element.purchase_year)
                            {
                                double personal = ((double)down_payment + (double)element.transaction_cost * (double)element.total_cost) * Math.Pow((1 + inflation), element.purchase_year - c_year);
                                cash_flows[i] -= personal;
                                if (personal < 0)
                                {// careful: negative means income, not expense !
                                    other_income[i] -= personal;
                                }
                                else
                                {
                                    if (i > (ret_age - c_age))
                                    {
                                        expenses_at_retirement[i] += personal;
                                    }
                                    else
                                    {
                                        expenses_prior_retirement[i] += personal;
                                    }
                                    debt_value[i] += annuity * (int)element.payment_duration * Math.Pow((1 + inflation), element.purchase_year - c_year);
                                }
                                 if (element.dream_type_id == 1)
                                    illiquid_asset[i] += ((double)element.total_cost) * Math.Pow((1 + inflation), element.purchase_year - c_year);

                            }

                            if (years[i] >= element.purchase_year && years[i] < element.purchase_year + element.payment_duration)
                            {
                                debt_charge[i] -= annuity * Math.Pow((1 + inflation), element.purchase_year - c_year);
                                cash_flows[i] -= annuity * Math.Pow((1 + inflation), element.purchase_year - c_year);
                                if (i > 0 && years[i] != element.purchase_year && (element.sell_year == 0 || years[i] < element.sell_year))
                                    debt_value[i] = debt_value[i - 1] - annuity * Math.Pow((1 + inflation), element.purchase_year - c_year);

                            }
                            if (years[i] >= element.purchase_year && (element.sell_year == 0 || years[i] < element.sell_year))
                            {
                                income[i] += ((double)element.rental_net_income * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                                other_income[i] += ((double)element.rental_net_income * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                                expenses[i] += (-(double)element.yearly_expenses * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                                if (i > (ret_age - c_age))
                                {
                                    expenses_at_retirement[i] -= (-(double)element.yearly_expenses * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                                    //System.out.println("expenses = " + element.expenses);
                                }
                                else
                                {
                                    expenses_prior_retirement[i] -= (-(double)element.yearly_expenses * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                                }
                                cash_flows[i] += ((double)element.rental_net_income * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                                cash_flows[i] += (-(double)element.yearly_expenses * (double)element.total_cost) * Math.Pow(1 + inflation, i);
                            }
                        }
                    }
                    //System.out.println("income = " + element.income * Math.pow(1+inflation,i));
                }
                if (c_personaPlan.lifeEvent != null)
                foreach (LifeEvent element in c_personaPlan.lifeEvent)
                {
                    element.starting_year = start_year + (element.starting_age - c_age);

                    if (element.dream_type_id == 6)
                    {
                        if (years[i] == element.starting_year)
                        {
                            income[i] += (double)element.value * Math.Pow(1 + inflation, i);
                            other_income[i] += (double)element.value * Math.Pow(1 + inflation, i);
                            cash_flows[i] += (double)element.value * Math.Pow(1 + inflation, i);
                        }
                    }
                    
                    else if (element.dream_type_id == 5)
                    {                        
                        if (years[i] >= element.starting_year)
                        {
                            expenses[i] += ((double)element.yearly_cost_reduction * income[i]) * Math.Pow(1 + inflation, i);
                            if (i > (ret_age - c_age))
                            {
                                expenses_at_retirement[i] -= ((double)element.yearly_cost_reduction * income[i]) * Math.Pow(1 + inflation, i);
                            }
                            else
                            {
                                expenses_prior_retirement[i] -= ((double)element.yearly_cost_reduction * income[i]) * Math.Pow(1 + inflation, i);
                            }
                            cash_flows[i] += ((double)element.yearly_cost_reduction * income[i]) * Math.Pow(1 + inflation, i);
                        }
                    }
                    
                    else if (element.dream_type_id == 4)
                    {
                        if (element.dream_id == null || element.dream_id <=0)
                        {
                            if (years[i] == element.starting_year)
                            {
                                income[i] += ((double)element.value) * Math.Pow(1 + inflation, i);
                                other_income[i] += ((double)element.value) * Math.Pow(1 + inflation, i);
                                expenses[i] -= ((double)element.value * (double)(element.transaction_cost + element.transaction_tax)) * Math.Pow(1 + inflation, i);
                                if (i > (ret_age - c_age))
                                {
                                    expenses_at_retirement[i] += ((double)element.value * (double)(element.transaction_cost + element.transaction_tax)) * Math.Pow(1 + inflation, i);
                                }
                                else
                                {
                                    expenses_prior_retirement[i] += ((double)element.value * (double)(element.transaction_cost + element.transaction_tax)) * Math.Pow(1 + inflation, i);
                                }                                
                            }                           
                        }
                        else if (element.dream_id != null)
                        {
                            foreach (Dream dream in c_personaPlan.dreams)
                            {
                                if (dream.id == element.dream_id)
                                {
                                    if (years[i] == element.starting_year)
                                    {
                                        illiquid_asset[i] -= ((double)dream.total_cost) * Math.Pow((1 + inflation), i);

                                        decimal down_payment = (decimal)(dream.down_payment * dream.total_cost);
                                        double annuity = (down_payment < 0) ? 0 : pmt((double)dream.mortage_interest_rate, (int)dream.payment_duration, (double)dream.total_cost - (double)down_payment, dream.purchase_year); // new in 5.2: inflation ajusted 
                                        double sum_pay_purchase_residence = 0;
                                        if (dream.purchase_age + (int)dream.payment_duration > element.starting_age)
                                            sum_pay_purchase_residence = annuity * (dream.purchase_age + (int)dream.payment_duration - element.starting_age);
                                        double money_get_back = (double)element.value - sum_pay_purchase_residence;
                                        if (money_get_back > 0)
                                        {
                                            income[i] += money_get_back * Math.Pow((1 + inflation), i);
                                            other_income[i] += money_get_back * Math.Pow((1 + inflation), i);
                                        }
                                        else if (money_get_back < 0)
                                        {
                                            double annuity_continue = Math.Abs(money_get_back) / (dream.purchase_age + (int)dream.payment_duration - element.starting_age);

                                            for (int k = element.starting_age; k <= dream.purchase_age + (int)dream.payment_duration; ++k)
                                            {
                                                debt_charge[i] -= annuity_continue * Math.Pow((1 + inflation), element.starting_year - c_year);
                                                cash_flows[i] -= annuity_continue * Math.Pow((1 + inflation), element.starting_year - c_year);
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }

                //equity curve

                if (i == 0) opening[i] = c_liquid_assets; else opening[i] = equity_curve[i - 1];
                investment[i] = Math.Max(cash_flows[i], 0);
                risk_returns[i] = (opening[i] + investment[i]) * risk_return;

                disposal[i] = Math.Min(cash_flows[i], 0);

                taxes[i] = disposal[i] * income_tax * base_tax / (1 - income_tax * base_tax);

                // Monte-carlo simulations !!
                if (MC_compute)
                { // only if wanted...
                    double open_value;
                    double sum_disposal_taxes = disposal[i] + taxes[i];
                    double sum_risk_return_and_one = 1 + risk_return;
                    Parallel.For(0, nb_trials, j =>
                    //Phuc comment, convert for to Parallel                   
                    //for (int j = 0; j < nb_trials; j++)
                    {
                        if (i == 0) open_value = c_liquid_assets; else open_value = trials[j];
                        trials[j] = (open_value + investment[i])
                            * Math.Max(0, NormaleInverse(RandomGen.Next(), sum_risk_return_and_one, volatility))
                                + sum_disposal_taxes;
                        sorted_trials[j] = trials[j];
                    });

                    // sort in ascending order 
                    Array.Sort(sorted_trials);

                    // save a bit of time by perfoming percentile only if needed
                    if (MC_top_value != 0) top_equity_curve[i] = Percentile(sorted_trials, (1 - MC_top_value));
                    average_equity_curve[i] = Percentile(sorted_trials, 0.50);
                    if (MC_bottom_value != 0) bottom_equity_curve[i] = Percentile(sorted_trials, MC_bottom_value);

                    //income_from_investment[i] = (-disposal[i] < bottom_equity_curve[i])?-disposal[i]:0; // only if something is left !
                    // modif after LB's testing: align with equity curve < 0
                    // last modif for X.0 21/06/2015
                    income_from_investment[i] = (bottom_equity_curve[i] >= 0) ? -disposal[i]
                            : Math.Max(0, -disposal[i] + bottom_equity_curve[i]);
                }

                equity_curve[i] = opening[i] + investment[i] + risk_returns[i] + disposal[i] + taxes[i];


                // debt ratio
                if (income[i] == 0)
                    if (debt_charge[i] == 0) debt_ratio[i] = 0; else debt_ratio[i] = 1;
                else debt_ratio[i] = -debt_charge[i] / income[i];

            }

            // new in 5.2: limit negative part of equity curve to 10% of max positive so far
            double max_equity_curve = 0, max_top_equity_curve = 0,
                    max_average_equity_curve = 0, max_bottom_equity_curve = 0;
            for (i = 0; i < period; i++)
            {
                if (equity_curve[i] > max_equity_curve) max_equity_curve = equity_curve[i];
                if (top_equity_curve[i] > max_top_equity_curve)
                    max_top_equity_curve = top_equity_curve[i];
                if (average_equity_curve[i] > max_average_equity_curve)
                    max_average_equity_curve = average_equity_curve[i];
                if (bottom_equity_curve[i] > max_bottom_equity_curve)
                    max_bottom_equity_curve = bottom_equity_curve[i];
            }

            for (i = 0; i < period; i++)
            {
                display_equity_curve[i] = equity_curve[i];
                if (equity_curve[i] < 0 && (max_equity_curve >= 0))
                    if ((-equity_curve[i]) > 0.1 * max_equity_curve)
                        display_equity_curve[i] = -0.1 * max_equity_curve;
                display_top_equity_curve[i] = top_equity_curve[i];
                if (top_equity_curve[i] < 0 && (max_top_equity_curve >= 0))
                    if ((-top_equity_curve[i]) > 0.1 * max_top_equity_curve)
                        display_top_equity_curve[i] = -0.1 * max_top_equity_curve;
                display_average_equity_curve[i] = average_equity_curve[i];
                if (average_equity_curve[i] < 0 && (max_average_equity_curve >= 0))
                    if ((-average_equity_curve[i]) > 0.1 * max_average_equity_curve)
                        display_average_equity_curve[i] = -0.1 * max_average_equity_curve;
                display_bottom_equity_curve[i] = bottom_equity_curve[i];
                if (bottom_equity_curve[i] < 0 && (max_bottom_equity_curve >= 0))
                    if ((-bottom_equity_curve[i]) > 0.1 * max_bottom_equity_curve)
                        display_bottom_equity_curve[i] = -0.1 * max_bottom_equity_curve;
            }
        }

        public MainResult CalculatorBasic(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            MainResult result = new MainResult();
            this.Compute(personaPlan);
            for (int i = 0; i < bottom_equity_curve.Length; ++i)
            {
                if (bottom_equity_curve[i] < 0)
                {
                    result.broken_age = c_age + i;
                    break;
                }
            }
            //for (int i = 0; i < equity_curve.Length; ++i)
            //{
            //    if (equity_curve[i] < 0)
            //    {
            //        result.broken_age = c_age + i;
            //        break;
            //    }
            //}

            if (result.broken_age == null)
                result.broken_age = personaPlan.death_age + 30;

            result.social_security = Math.Round(r_social_income / 12);
            result.risk_return = 5 / 100;
            result.expected_return = 5 / 100;
            result.project_value = 2645000;
            result.saving_at_retirement = 1845000;
            DateTime end = DateTime.Now;
            result.processing_time = (end - begin).Milliseconds;
            return result;
        }

        public object CalculateIncomeExpense(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            MainResult basic = new MainResult();
            this.Compute(personaPlan);
            for (int i = 0; i < bottom_equity_curve.Length; ++i)
            {
                if (bottom_equity_curve[i] < 0)
                {
                    basic.broken_age = c_age + i;
                    break;
                }
            }

            if (basic.broken_age == null)
                basic.broken_age = personaPlan.death_age + 30;

            basic.social_security = Math.Round(r_social_income / 12);
            basic.risk_return = 5 / 100;
            basic.expected_return = 5 / 100;
            basic.project_value = 0;
            basic.saving_at_retirement = 0;
            DateTime end = DateTime.Now;
            basic.processing_time = (end - begin).Milliseconds;

            double[] saving_at_retirement = Utils.PositiveArrays(Utils.SubtractionArrays(Utils.SumArrays(income_from_social_security, Utils.SumArrays(income_from_investment, other_income)), expenses_at_retirement));
            for (int i = 0; i <= personaPlan.retirement_age - personaPlan.start_age; i++)
            {
                saving_at_retirement[i] = 0;
            }
            var result = new
            {
                basic = basic,
                income_from_salary = income_from_salary,
                income_from_social_security = income_from_social_security,
                income_from_investment = income_from_investment,
                other_income = other_income,
                expenses_prior_retirement = Utils.PositiveArrays(expenses_prior_retirement),
                saving = Utils.PositiveArrays(Utils.SubtractionArrays(income_from_salary, expenses_prior_retirement)),
                saving_at_retirement = saving_at_retirement,
                insufficient_funds = Utils.SubtractionArrays(expenses_at_retirement, Utils.MinArrays(expenses_at_retirement, Utils.SumArrays(income_from_social_security, Utils.SumArrays(income_from_salary, Utils.SumArrays(income_from_investment, other_income))))),
                expenses_at_retirement = Utils.MinArrays(expenses_at_retirement, Utils.SumArrays(income_from_social_security, Utils.SumArrays(income_from_salary, Utils.SumArrays(income_from_investment, other_income)))
            )

            };
            return result;
        }

        public object CalculateEquityCurve(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            MainResult basic = new MainResult();
            this.Compute(personaPlan);
            for (int i = 0; i < bottom_equity_curve.Length; ++i)
            {
                if (bottom_equity_curve[i] < 0)
                {
                    basic.broken_age = c_age + i;
                    break;
                }
            }

            if (basic.broken_age == null)
                basic.broken_age = personaPlan.death_age + 30;

            basic.social_security = Math.Round(r_social_income / 12);
            basic.risk_return = 5 / 100;
            basic.expected_return = 5 / 100;
            basic.project_value = 2645000;
            basic.saving_at_retirement = 1845000;
            DateTime end = DateTime.Now;
            basic.processing_time = (end - begin).Milliseconds;
            var result = new { basic = basic, top_equity_curve = top_equity_curve, bottom_equity_curve = bottom_equity_curve, average_equity_curve = equity_curve };

            personaPlan.risk_return = 0;
            this.Compute(personaPlan);
            var resultFinal = new { basic = result.basic, top_equity_curve = result.top_equity_curve, bottom_equity_curve = result.bottom_equity_curve, average_equity_curve = result.average_equity_curve, zero_return = display_average_equity_curve };


            return resultFinal;
        }

        public object CalculateIlliquidCurve(PersonaPlan personaPlan)
        {
            DateTime begin = DateTime.Now;
            MainResult basic = new MainResult();
            this.Compute(personaPlan);
            for (int i = 0; i < bottom_equity_curve.Length; ++i)
            {
                if (bottom_equity_curve[i] < 0)
                {
                    basic.broken_age = c_age + i;
                    break;
                }
            }

            if (basic.broken_age == null)
                basic.broken_age = personaPlan.death_age + 30;

            basic.social_security = Math.Round(r_social_income / 12);
            basic.risk_return = 5 / 100;
            basic.expected_return = 5 / 100;
            basic.project_value = 0;
            basic.saving_at_retirement = 0;
            DateTime end = DateTime.Now;
            basic.processing_time = (end - begin).Milliseconds;

            var result = new
            {
                basic = basic,
                illiquid_asset = illiquid_asset,
                net_equity = Utils.PositiveArrays(Utils.SubtractionArrays(illiquid_asset, debt_value))
            };
            return result;
        }

        public double[] IncomeYearByYear(PersonaPlan personaPlan)
        {
            this.Compute(personaPlan);
            return income;
        }

        public double[] ExpensesYearByYear(PersonaPlan personaPlan)
        {
            this.Compute(personaPlan);
            double[] expenses_total = new double[period];
            for (int i = 0; i < expenses_total.Count(); i++)
            {
                expenses_total[i] = expenses[i] + debt_charge[i];
            }
            return expenses_total;
        }
    }
}
