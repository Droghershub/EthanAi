using BTO.UI.Pages.account;
using BTO.UI.Utils;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace BTO.UI
{
    public class Driver
    {

        public static IWebDriver Instance { get; set; }

        public static void Intitialize()
        {
            Instance = new ChromeDriver();
            TurnOnWait(5);
            Instance.Manage().Window.Maximize();
        }

        private static void Navigate()
        {
            Instance.Navigate().GoToUrl(BaseAddress);
            TurnOnWait(3);
        }

        public static void TurnOnWait()
        {
            Instance.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(5));
        }

        public static void TurnOnWait(int seconds)
        {
            Instance.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(seconds));
        }

        public static bool isElementPresent(By by)
        {
            bool present;
            try
            {
                Thread.Sleep(2000);
                //Driver.Instance.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(2));
                var element = Driver.Instance.FindElement(by);
                if (element.Size.Height == 0 && element.Size.Width == 0)
                {
                    present = false;
                }
                else
                {
                    present = true;
                }
            }
            catch (NoSuchElementException e)
            {
                present = false;
            }
            return present;
        }

        public static void goToHomePage()
        {
            By by = By.Id("toolbox-panel");
            if (!Driver.isElementPresent(by))
            {
                LoginAccount.loginBaseAccount();
            }
            scrollToTop();
        }


        public static void scrollToTop() {
            Actions action = new Actions(Driver.Instance);
            action.SendKeys(Keys.PageUp);
            TurnOnWait(2);
        }

        public static IWebElement FindElement(By by, int timeoutInSeconds)
        {
            if (timeoutInSeconds > 0)
            {
                var wait = new WebDriverWait(Driver.Instance, TimeSpan.FromSeconds(timeoutInSeconds));
                return wait.Until(drv => drv.FindElement(by));
            }
            return Driver.Instance.FindElement(by);
        }

        public static string BaseAddress {
            get {
                return ConstantsUtils.Url;
            }
        }

        public static void Close()
        {
            Instance.Close();
        }
    }
}
