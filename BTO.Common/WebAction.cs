using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
namespace BTO.Common
{
    public static class WebAction
    {
        public enum Action
        {
            [Description("Load session")]
            LOAD_SESSION,
            [Description("Click tab {{name}}")]
            TAB_CLICK,
            [Description("Change to session {{name}}")]
            CHANGE_SESSION,
            [Description("Move dream {{name}} purchage age")]
            MOVE_DREAM_PURCHAGE,
            [Description("Move lifeevent {{name}} purchage age")]
            MOVE_LIFEEVENT_PURCHAGE,
            [Description("Add dream")]
            ADD_DREAM,
            [Description("Add new lifeevent")]
            ADD_LIFEEVENT,
            [Description("Edit dream {{name}}")]
            EDIT_DREAM,
            [Description("Edit life event {{name}}")]
            EDIT_LIFEEVENT,
            [Description("Remove dream {{name}}")]
            REMOVE_DREAM,
            [Description("Remove lifeevent {{name}}")]
            REMOVE_LIFEEVENT,
            [Description("Reset plan")]
            RESET_PLAN_BUTTON,
            [Description("Change income today")]
            CHANGE_INCOME_TODAY,
            [Description("Change expense today")]
            CHANGE_EXPENSE_TODAY,
            [Description("Change current saving")]
            CHANGE_CURRENT_SAVING,
            [Description("Change inflation")]
            CHANGE_INFLATION,
            [Description("Change salary evolution")]
            CHANGE_SALARY_EVOLUTION,
            [Description("Change start age")]
            CHANGE_START_AGE,
            [Description("Change start year")]
            CHANGE_START_YEAR,
            [Description("Change retirement age")]
            CHANGE_RETIREMENT_AGE,
            [Description("Change social security age")]
            CHANGE_SOCIAL_SECURITY_AGE,
            [Description("Change death age")]
            CHANGE_DEATH_AGE,
            [Description("Change expense at retirement")]
            CHANGE_EXPENSE_AT_RETIREMENT,
            [Description("Change social security percent")]
            CHANGE_SOCIAL_SECURITY_PERCENT,
            [Description("Change top value")]
            CHANGE_MC_TOP_VALUE,
            [Description("Change bottom value")]
            CHANGE_MC_BOTTOM_VALUE,
            [Description("Change number of trials")]
            CHANGE_NUMBER_TRIALS,
            [Description("Change risk return")]
            CHANGE_RISK_RETURN,
            [Description("Change risk")]
            CHANGE_VOLATILITY,
            [Description("Change retirement lifestyle")]
            CHANGE_RETIREMENT_LIFESTYLE,
            [Description("Change name")]
            CHANGE_NAME,
            [Description("Change status")]
            CHANGE_STATUS,
            [Description("Change currency")]
            CHANGE_CURRENCY_CODE,
            [Description("Simulate ranking dream")]
            SIMULATE_RANKING_DREAM,
            [Description("Click new scenario")]
            NEW_SCENARIO_BUTTON,
            [Description("Click current scenario")]
            CURRENT_SCENARIO_BUTTON,
            [Description("Open manage scenario")]
            MANAGE_SCENARIO,
            [Description("Duplicate scenario")]
            DUPLICATE_SCENARIO,
            [Description("New scenario")]
            NEW_SCENARIO,
            [Description("Delete scenario")]
            DELETE_SCENARIO,
            [Description("Rename scenario")]
            RENAME_SCENARIO,
            [Description("Make current scenario")]
            MAKE_CURRENT_SCENARIO,
            [Description("Make new scenario")]
            MAKE_NEW_SCENARIO,
            [Description("Close manage scenario")]
            CLOSE_SCENARIOS,
            [Description("Click manage solution")]
            MANAGE_SOLUTION,
            [Description("Load solution")]
            LOAD_SOLUTION,
            [Description("Save solution")]
            SAVE_SOLUTION,
            [Description("Delete solution")]
            DELETE_SOLUTION,
            [Description("Rename solution")]
            RENAME_SOLUTION,
            [Description("Close solution")]
            CLOSE_SOLUTION,
            [Description("Change Cashflow")]
            CHANGE_CASH_FLOW,
            [Description("Change Invesment")]
            CHANGE_INVESTMENT_START,
            [Description("Update Profile")]
            UPDATE_PROFILE

        };
        public enum TabName
        {
            Main,
            IncomeExpenses,
            LiquidIlliquidAsset,
            IlliquidAsset,
            RankingDreams,
            ShareScreen,
            SharingSession,
            SharingSessionOnlyView
        };

        public enum sessionName
        {
            SavingRate,
            LifeStyle,
            Investment,
            IlliquidAsset,
            TaxOptimization
        }

    }
    public class Tab
    {
        public string Name { get; set; }
    }
    public class Session
    {
        public string Name { get; set; }
    }

}
