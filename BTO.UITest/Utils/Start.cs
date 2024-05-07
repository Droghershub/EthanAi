using BTO.UI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechTalk.SpecFlow;

namespace BTO.UITest.Utils
{
    public class Start : Driver
    {
        [BeforeScenario]
        public void Setup()
        {
            Driver.Intitialize();
            Driver.Instance.Navigate().GoToUrl(Driver.BaseAddress);
        }

        [AfterScenario]
        public void TearDown()
        {
            Driver.Close();
        }
    }
}
