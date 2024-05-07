using BTO.Model;
using BTO.Admin.Models;
using BTO.Modules;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Web;
using System.Web.Mvc;
using System.Linq;
using Newtonsoft.Json;
//using Microsoft.AspNet.SignalR;
//using BTO.ShareScreen;
namespace BTO
{
    public static class GlobalConfig
    {
        public static Dictionary<int, Rule> rules = new Dictionary<int, Rule>();
        public static Dictionary<int, Dictionary<string, object>> parametersNotFromRule = new Dictionary<int, Dictionary<string, object>>();

        public static Dictionary<BTO.Common.WebAction.Action, string> parametterNeedForceUpdate =
            new Dictionary<BTO.Common.WebAction.Action, string> 
            {
                {BTO.Common.WebAction.Action.CHANGE_NUMBER_TRIALS, "persona_plan.number_trials" }, // Menu
                {BTO.Common.WebAction.Action.CHANGE_MC_TOP_VALUE, "persona_plan.mc_top_value" }, // Article
                {BTO.Common.WebAction.Action.CHANGE_MC_BOTTOM_VALUE, "persona_plan.mc_bottom_value" }, // Favorites List              
            };
        public static Dictionary<string, object> GetParametterNeedForceUpdate(int product_version_id, BTO.Service.IParameterService _paraServices)
        {
            if (!parametersNotFromRule.ContainsKey(product_version_id))
            {
                List<Parameter> parameters = _paraServices.GetParameterNotFromRuleByProductVersionId(product_version_id);
                Dictionary<string, object> dictionary = new Dictionary<string, object>();
                foreach (Parameter parameter in parameters)
                {
                    if (!dictionary.ContainsKey(parameter.name))
                    {
                        dictionary.Add(parameter.name, parameter.default_value);
                    }
                }
                parametersNotFromRule.Add(product_version_id, dictionary);
            }

            return parametersNotFromRule[product_version_id];
        }

        public static void UpdateParametterNeedForceUpdate(int product_version_id, BTO.Service.IParameterService _paraServices)
        {
            List<Parameter> parameters = _paraServices.GetParameterNotFromRuleByProductVersionId(product_version_id);
            Dictionary<string, object> dictionary = new Dictionary<string, object>();
            foreach (Parameter parameter in parameters)
            {
                if (!dictionary.ContainsKey(parameter.name))
                {
                    dictionary.Add(parameter.name, parameter.default_value);
                }
            }
            if (!parametersNotFromRule.ContainsKey(product_version_id))
            {
                parametersNotFromRule.Add(product_version_id, dictionary);
            }
            else
            {
                parametersNotFromRule[product_version_id] = dictionary;
            }
        }

        public static void ForceUpdateParameter(PersonaPlan personaPlan, int product_version_id, BTO.Service.IParameterService _paraServices)
        {
            Dictionary<string, object> parameters = GetParametterNeedForceUpdate(product_version_id, _paraServices);
            personaPlan.number_trials = Int32.Parse(parameters["persona_plan.number_trials"].ToString());
            personaPlan.mc_top_value = Decimal.Parse(parameters["persona_plan.mc_top_value"].ToString());
            personaPlan.mc_bottom_value = Decimal.Parse(parameters["persona_plan.mc_bottom_value"].ToString());
        }
        public static bool NotifyForceUpdateParameter(PersonaPlan personaPlan, int product_version_id, BTO.Service.IParameterService _paraServices)
        {
            Dictionary<string, object> parameters = GetParametterNeedForceUpdate(product_version_id, _paraServices);
            bool changed = false;
            changed = changed || (personaPlan.number_trials != Int32.Parse(parameters["persona_plan.number_trials"].ToString()));
            return changed;
        }


        public static string GetRule(int product_version_id, List<Persona> personas, BTO.Service.IParameterService _paraServices)
        {
            if (rules.ContainsKey(product_version_id))
            {
                Rule rule = (Rule)rules[product_version_id].Clone();


                foreach (CPF cpf in rule.cpf)
                {
                    UpdateRuleForCPF(cpf, personas);
                }

                foreach (Income income in rule.income)
                {
                    UpdateRuleForIncome(income, personas);
                }

                foreach (Expense expense in rule.expense)
                {
                    UpdateRuleForExpense(expense, personas);
                }
                foreach (Income invest in rule.investment_start)
                {
                    UpdateRuleForIncome(invest, personas);
                }
                
                string serializeData = JsonConvert.SerializeObject(rule);

                return serializeData;
            }
            else
            {
                Rule rule = getRuleFromDB(product_version_id, _paraServices);
                rules.Add(product_version_id, rule);
                return GetRule(product_version_id, personas, _paraServices);
            }
        }
        public static string GetRule(int product_version_id, BTO.Service.IParameterService _paraServices)
        {
            if (rules.ContainsKey(product_version_id))
            {
                Rule rule = rules[product_version_id];

                string serializeData = JsonConvert.SerializeObject(rule);

                return serializeData;
            }
            else
            {
                Rule rule = getRuleFromDB(product_version_id, _paraServices);
                rules.Add(product_version_id, rule);
                return GetRule(product_version_id, _paraServices);
            }
        }
        public static Rule getRuleFromDB(int product_version_id, BTO.Service.IParameterService _paraServices)
        {
            Rule rule = new Rule();
            List<Parameter> paras = _paraServices.GetAllByProductVersionId(product_version_id);
            Parameter initial = paras.Where(x => x.parent_id == null && x.type == 2 && x.name == "rule_parameter").FirstOrDefault();
            rule.parameter = getParameter(initial, paras);
            Parameter income = paras.Where(x => x.parent_id == null && x.type == 2 && x.name == "rule_income").FirstOrDefault();
            rule.income = getListIncome(income, paras);
            Parameter expense = paras.Where(x => x.parent_id == null && x.type == 2 && x.name == "rule_expense").FirstOrDefault();
            rule.expense = getListExpense(expense, paras);
            Parameter cpf = paras.Where(x => x.parent_id == null && x.type == 2 && x.name == "rule_cpf").FirstOrDefault();
            rule.cpf = getListCPF(cpf, paras);
            Parameter inv = paras.Where(x => x.parent_id == null && x.type == 2 && x.name == "rule_investment_start").FirstOrDefault();
            rule.investment_start = getListIncome(inv, paras);
            rule.formula_parameter = getListFormulaParameter(paras);
            return rule;
        }

        private static Dictionary<string, bool> getListFormulaParameter(List<Parameter> paras)
        {
            Dictionary<string, bool>  list = new Dictionary<string, bool>();
            foreach (Parameter item in paras)
            {
                if (item.is_choose_formula == true && !item.name.Equals("rule_cpf") && !item.name.Equals("rule_parameter") && !item.name.Equals("rule_income") && !item.name.Equals("rule_expense") && !item.name.Equals("rule_investment_start"))
                    list.Add(item.name.Substring(item.name.StartsWith("rule_") ? "rule_".Length : 0), true);
            }
            return list;
        }
        private static List<CPF> getListCPF(Parameter para, List<Parameter> paras)
        {
            List<CPF> result = new List<CPF>();
            List<Parameter> sort = paras.Where(t => t.parent_id == para.id).ToList();
            foreach (Parameter p in sort)
            {
                CPF cpf = new CPF();
                cpf.default_value = Convert.ToDecimal(p.default_value);
                cpf.name = p.name.Substring(p.name.StartsWith("rule_") ? "rule_".Length : 0);
                cpf.isPosistive = cpf.default_value > 0;
                cpf.isSummable = p.isSummable != null ? (bool)p.isSummable : false;
                cpf.is_choose_formula = p.is_choose_formula != null ? (bool)p.is_choose_formula : false;
                cpf.children = new List<CPF>();
                AddtoListCPF(cpf, p, paras);
                result.Add(cpf);

            }
            return result;
        }
        private static List<Income> getListIncome(Parameter para, List<Parameter> paras)
        {
            List<Income> result = new List<Income>();
            List<Parameter> sort = paras.Where(t => t.parent_id == para.id).ToList();
            foreach (Parameter p in sort)
            {
                Income income = new Income();
                income.default_value = Convert.ToDecimal(p.default_value);
                income.name = p.name.Substring(p.name.IndexOf("rule_") > -1 ? "rule_".Length : 0);
                income.isPosistive = income.default_value > 0;
                income.isSummable = p.isSummable != null ? (bool)p.isSummable : false;
                income.is_choose_formula = p.is_choose_formula != null ? (bool)p.is_choose_formula : false;
                income.children = new List<Income>();
                AddtoListIncome(income, p, paras);
                result.Add(income);

            }
            return result;
        }
        private static List<Expense> getListExpense(Parameter para, List<Parameter> paras)
        {
            List<Expense> result = new List<Expense>();
            List<Parameter> sort = paras.Where(t => t.parent_id == para.id).ToList();
            foreach (Parameter p in sort)
            {
                Expense expense = new Expense();
                expense.default_value = Convert.ToDecimal(p.default_value);
                expense.name = p.name.Substring(p.name.StartsWith("rule_") ? "rule_".Length : 0);
                expense.isPosistive = expense.default_value > 0;
                expense.isSummable = p.isSummable != null ? (bool)p.isSummable : false;
                expense.is_choose_formula = p.is_choose_formula != null ? (bool)p.is_choose_formula : false;
                expense.children = new List<Expense>();
                AddtoListExpense(expense, p, paras);
                result.Add(expense);

            }
            return result;
        }
        private static void AddtoListIncome(Income ic, Parameter p, List<Parameter> paras)
        {
            List<Parameter> sort = paras.Where(t => t.parent_id == p.id).ToList();
            foreach (Parameter p1 in sort)
            {
                Income income = new Income();
                income.default_value = Convert.ToDecimal(p1.default_value);
                income.name = p1.name.Substring(p1.name.StartsWith("rule_") ? "rule_".Length : 0);
                income.isPosistive = income.default_value > 0;
                income.isSummable = p1.isSummable != null ? (bool)p1.isSummable : false;
                income.is_choose_formula = p.is_choose_formula != null ? (bool)p.is_choose_formula : false;
                income.children = new List<Income>();
                ic.children.Add(income);
                List<Parameter> childs = paras.Where(t => t.parent_id == p1.id).ToList();
                if (childs != null && childs.Count > 0)
                {
                    AddtoListIncome(income, p1, paras);
                    /*foreach (Parameter p2 in childs)
                    {
                        AddtoListIncome(income, p1, paras);
                    }*/
                }
            }
        }

        private static void AddtoListExpense(Expense ic, Parameter p, List<Parameter> paras)
        {
            List<Parameter> sort = paras.Where(t => t.parent_id == p.id).ToList();
            foreach (Parameter p1 in sort)
            {
                Expense expense = new Expense();
                expense.default_value = Convert.ToDecimal(p1.default_value);
                expense.name = p1.name.Substring(p1.name.StartsWith("rule_") ? "rule_".Length : 0);
                expense.isPosistive = expense.default_value > 0;
                expense.isSummable = p1.isSummable != null ? (bool)p1.isSummable : false;
                expense.is_choose_formula = p.is_choose_formula != null ? (bool)p.is_choose_formula : false;
                expense.children = new List<Expense>();
                ic.children.Add(expense);
                List<Parameter> childs = paras.Where(t => t.parent_id == p1.id).ToList();
                if (childs != null && childs.Count > 0)
                {

                    AddtoListExpense(expense, p1, paras);
                    /*foreach (Parameter p2 in childs)
                    {
                        AddtoListExpense(expense, p2, paras);
                    }*/
                }
            }
        }
        private static void AddtoListCPF(CPF ic, Parameter p, List<Parameter> paras)
        {
            List<Parameter> sort = paras.Where(t => t.parent_id == p.id).ToList();
            foreach (Parameter p1 in sort)
            {
                CPF cpf = new CPF();
                cpf.default_value = Convert.ToDecimal(p1.default_value);
                cpf.name = p1.name.Substring(p1.name.StartsWith("rule_") ? "rule_".Length : 0);
                cpf.isPosistive = cpf.default_value > 0;
                cpf.isSummable = p1.isSummable != null ? (bool)p1.isSummable : false;
                cpf.is_choose_formula = p.is_choose_formula != null ? (bool)p.is_choose_formula : false;
                cpf.children = new List<CPF>();
                ic.children.Add(cpf);
                List<Parameter> childs = paras.Where(t => t.parent_id == p1.id).ToList();
                if (childs != null && childs.Count > 0)
                {

                    AddtoListCPF(cpf, p1, paras);
                    /*foreach (Parameter p2 in childs)
                    {
                        AddtoListCPF(cpf, p2, paras);
                    }*/
                }
            }
        }
        private static Dictionary<string, object> getParameter(Parameter para, List<Parameter> paras)
        {
            Dictionary<string, object> result = new Dictionary<string, object>();
            foreach (Parameter p in paras)
            {
                if (p.parent_id == para.id)
                {
                    result.Add(p.name.Substring(p.name.StartsWith("rule_") ? "rule_".Length : 0), Convert.ToDecimal(p.default_value));
                }
            }
            return result;
        }
        public static Dictionary<string, object> GetParameter(int id, BTO.Service.IParameterService _paraServices)
        {
            if (rules.ContainsKey(id))
            {
                return rules[id].parameter;
            }
                
            else
            {
                GetRule(id, _paraServices);
                if (rules.ContainsKey(id))
                {
                    return rules[id].parameter;
                }
                
                else
                {
                    return null;
                }
            } 
                
        }

        public static List<Expense> GetDefaultExpense(int id)
        {
            if (rules.ContainsKey(id))
            {
                return rules[id].expense;
            }
            else return null;
        }


        public static void UpdateRuleForCPF(BTO.Admin.Models.CPF cpf, List<Persona> personas)
        {
            Persona persona = personas.Where(x => x.variable == cpf.name).FirstOrDefault();
            if (persona != null && persona.value != null)
            {
                cpf.value = (decimal)persona.value;
            }
            else
                cpf.value = cpf.default_value;
            if (cpf.children != null && cpf.children.Count > 0)
            {
                foreach (CPF childCPF in cpf.children)
                {
                    UpdateRuleForCPF(childCPF, personas);
                }
            }
        }

        public static void UpdateRuleForIncome(Income income, List<Persona> personas)
        {
            Persona persona = personas.Where(x => x.variable == income.name).FirstOrDefault();
            if (persona != null && persona.value != null)
            {
                income.value = (decimal)persona.value;
            }
            else
                income.value = income.default_value;
            if (income.children != null && income.children.Count > 0)
            {
                foreach (Income childIncome in income.children)
                {
                    UpdateRuleForIncome(childIncome, personas);
                }
            }
        }

        public static void UpdateRuleForExpense(Expense expense, List<Persona> personas)
        {
            Persona persona = personas.Where(x => x.variable == expense.name).FirstOrDefault();
            if (persona != null && persona.value != null)
            {
                expense.value = (decimal)persona.value;
            }
            else
                expense.value = expense.default_value;
            if (expense.children != null && expense.children.Count > 0)
            {
                foreach (Expense childExpense in expense.children)
                {
                    UpdateRuleForExpense(childExpense, personas);
                }
            }
        }




        public static string GetRule(int id, List<Persona> personas)
        {
            if (rules.ContainsKey(id))
            {
                Rule rule = (Rule)rules[id].Clone();


                foreach (CPF cpf in rule.cpf)
                {
                    UpdateRuleForCPF(cpf, personas);
                }

                foreach (Income income in rule.income)
                {
                    UpdateRuleForIncome(income, personas);
                }

                foreach (Expense expense in rule.expense)
                {
                    UpdateRuleForExpense(expense, personas);
                }
                foreach (Income invest in rule.investment_start)
                {
                    UpdateRuleForIncome(invest, personas);
                }

                string serializeData = JsonConvert.SerializeObject(rule);

                return serializeData;
            }
            return string.Empty;
        }
        public static string GetRule(int id)
        {
            if (rules.ContainsKey(id))
            {
                Rule rule = rules[id];

                string serializeData = JsonConvert.SerializeObject(rule);

                return serializeData;
            }
            return string.Empty;
        }
    }
}
