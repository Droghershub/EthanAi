using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;

namespace BTO.Model.Common
{
    public enum FunctionPermission
    {
        CHANGE_START_AGE,
        ADD_DREAM,
        EDIT_DREAM,
        REMOVE_DREAM,
        ADD_LIFE_EVENT,
        EDIT_LIFE_EVENT,
        REMOVE_LIFE_EVENT,
        SWITCHED_PERSONA_PLAN,
        CHANGE_RETIREMENT_AGE,
        CHANGE_INCOME_TODAY,
        CHANGE_EXPENSE_TODAY,
        CHANGE_CURRENT_SAVING,
        CHANGE_VOLATILITY_SIMPLE,
        CHANGE_VOLATILITY_EXPERT,
        CHANGE_EXPENSE_AT_RETIREMENT,
        CHANGE_NUMBER_OF_TRIALS,
        CHANGE_TOP_VALUE,
        CHANGE_BOTTOM_VALUE,
        CHANGE_INFLATION,
        CHANGE_SALARY_EVOLUTION,
        SIMULATE_RANKING_DREAM,
        RESET_PLAN,
        ZOOM_TIMELINE,
        PLAYBACK,
        SHARING_SESSION,
        SAVE_SOLUTION,
        LOAD_SOLUTION,
        DELETE_SOLUTION,
        RENAME_SOLUTION,
        SAVE_NEW_SCENARIO,
        DUPLICATE_SCENARIO,
        DELETE_SCENARIO,
        RENAME_SCENARIO,
        MAKE_CURRENT_SCENARIO,
        MAKE_NEW_SCENARIO,
        CHANGE_LANGUAGE,
        CHANGE_CURRENCY,
        CHANGE_PASSWORD,
        MANAGE_PROFILE,
        VIEW_MAIN_TAB,
        VIEW_INCOMEEXPENSE_TAB,
        VIEW_LIQUID_ASSET_TAB,
        VIEW_ILLIQUID_ASSET_TAB,
        VIEW_RANKINGDREAM_TAB,
        VIEW_SHARING_SESSION_TAB,
        MANAGE_PARAMETER,
        MANAGE_USER,
        ORGANIZATION_UNIT,
        ROLE_MANAGEMENT,
        CHANGE_RETIREMENT_LIFESTYLE
    }
    public enum FunctionAction
    {
        DENIED=-1,
        READ=0,
        READ_WRITE=1
    }
    public enum UserRoleStatus
    {
        ASSIGN=0,
        REVOKE=1
    }
}
