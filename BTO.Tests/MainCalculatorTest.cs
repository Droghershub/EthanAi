using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using BTO.Model;
using BTO.Service;

using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Repository;
using BTO.Repository.Common;

namespace BTO.Tests
{
    [TestClass]
    public class MainCalculatorTest
    {
       
        [TestInitialize()]
        public void Initialize()
        {
            EducationTest educationTest = new EducationTest();
            educationTest.Test();
        }
       
    }
}
