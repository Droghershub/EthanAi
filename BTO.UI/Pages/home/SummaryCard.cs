using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.UI.Pages.home
{
    public class SummaryCard
    {

        public static void clickOnCard(string cardId)
        {
            var action = new Actions(Driver.Instance);
            var card = Driver.Instance.FindElement(By.Id(cardId));
            card.Click();
            Driver.TurnOnWait(2);
        }

        public static bool checkCardSessionIsShow(string cardSessionId) {
            Driver.TurnOnWait(4);
            By by = By.CssSelector("#" + cardSessionId + " .panel-close.btn-sm" );
            return Driver.isElementPresent(by);
        }

        public static void scrollToTop()
        {
            IJavaScriptExecutor js = Driver.Instance as IJavaScriptExecutor;
            js.ExecuteScript("window.scrollTo(0,0)");
            Driver.TurnOnWait(3);
        }
    }
}
