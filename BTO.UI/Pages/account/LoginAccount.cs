using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.UI.Pages.account
{
    public class LoginAccount
    {
        public static void clickLoginButton()
        {
            var action = new Actions(Driver.Instance);
            var loginButton = Driver.Instance.FindElement(By.CssSelector("#login-panel .right > input"));
            loginButton.Click();
            Driver.TurnOnWait(4);
        }

        public static void loginBaseAccount() {
            var userName = ConfigurationManager.AppSettings["BaseUserName"];
            var password = ConfigurationManager.AppSettings["BasePassword"];
            enterUserNameAndPassword(userName, password);
            clickLoginButton();
        }

        

        public static void enterUserNameAndPassword(string userName, string password)
        {
            Driver.Instance.FindElement(By.Id("email")).SendKeys(userName);
            Driver.Instance.FindElement(By.Id("password")).SendKeys(password);
        }

        public static String getToolbarPanelClass()
        {
            var result = "";
            By by = By.Id("toolbox-panel");
            if (Driver.isElementPresent(by))
            {
                var toolbox = Driver.Instance.FindElement(by);
                result = toolbox.GetAttribute("class");
             
            }
            return result;
        }



        public static void clickLogout()
        {            
            var action = new Actions(Driver.Instance);
            //#navbar-collapse-1 > ul.nav.navbar-nav.navbar-right > li.dropdown.open > a

            var accountButton = Driver.Instance.FindElement(By.XPath("//*[@id='navbar-collapse-1']/ul[2]/li[3]/a"));
            accountButton.Click();
            Driver.TurnOnWait(2);
            var logoutButton = Driver.Instance.FindElement(By.XPath("//*[@id='navbar-collapse-1']/ul[2]/li[3]/ul/li[6]/a"));
            logoutButton.Click();
            Driver.TurnOnWait(5);
        }

        public static bool isPresentEmailInputOfLoginPage() {
            By by = By.Id("email");
            return Driver.isElementPresent(by);
        }
    }
}
