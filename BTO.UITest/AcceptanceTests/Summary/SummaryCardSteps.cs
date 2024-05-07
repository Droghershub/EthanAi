using BTO.UI;
using BTO.UI.Pages.home;
using BTO.UITest.Utils;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using TechTalk.SpecFlow;

namespace BTO.UITest.AcceptanceTests.Summary
{
    [Binding, Scope(Feature = "Summary Card")]
    public class SummaryCardSteps : Start
    {
        [Given(@"I am at home page")]
        public void GivenIAmAtHomePage()
        {
            Driver.goToHomePage();
        }
        
        [When(@"I click on (.*)")]
        public void WhenIClickOn(string card)
        {
            SummaryCard.clickOnCard(card);
        }
        
        [Then(@"System will show (.*)")]
        public void ThenSystemWillShow(string card_session)
        {
            var show_card_session = SummaryCard.checkCardSessionIsShow(card_session);
            Assert.IsTrue(show_card_session);
        }
        
        [Then(@"I scroll to top")]
        public void ThenIScrollToTop()
        {
            SummaryCard.scrollToTop();
        }
        
        [Then(@"system will hide (.*)")]
        public void ThenSystemWillHide(string card_session)
        {
            var show_card_session = SummaryCard.checkCardSessionIsShow(card_session);
            Assert.IsFalse(show_card_session);
        }
        
        [Then(@"Session (.*) will be show again")]
        public void ThenSessionWillBeShowAgain(string card_session)
        {
            var show_card_session = SummaryCard.checkCardSessionIsShow(card_session);
            Assert.IsTrue(show_card_session);
        }
    }
}
