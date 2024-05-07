using BTO.UI;
using BTO.UI.Pages.account;
using BTO.UITest.Utils;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using TechTalk.SpecFlow;

namespace BTO.UITest.AcceptanceTests.Account
{
    [Binding, Scope(Feature = "LoginAccount")]
    public class LoginAccountSteps: Start
    {
        [Given(@"User is at login page")]
        public void GivenUserIsAtLoginPage()
        {
            //ScenarioContext.Current.Pending();
            //LoginAccount.loginBaseAccount();
        }

        [When(@"User enter (.*) and (.*)")]
        public void WhenUserEnterAnd(string userName, string password)
        {
            LoginAccount.enterUserNameAndPassword(userName, password);
        }

        [When(@"Click on Login button")]
        public void WhenClickOnLoginButton()
        {
            LoginAccount.clickLoginButton();

        }

        [Then(@"Success message will show if user login (.*)")]
        public void ThenSuccessMessageWillShowIfUserLogin(string success)
        {
            Boolean expectedSuccess = success == "true" ? true : false;
            Boolean realSuccess = LoginAccount.getToolbarPanelClass().Length > 0 ? true : false;
            Assert.AreEqual(expectedSuccess, realSuccess);
        }
        
        [Then(@"User click logout if login (.*)")]
        public void ThenUserClickLogoutIfLogin(string success)
        {
            Boolean expectedSuccess = success == "true" ? true : false;
            if (expectedSuccess) {
                LoginAccount.clickLogout();
                Assert.AreEqual(true, LoginAccount.isPresentEmailInputOfLoginPage());
            }
        }
    }
}
