using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BTO.Controllers
{
    public class AdminController : Controller
    {
        [Authorize]
        // GET: Admins
        public ActionResult Index()
        {
            return View();
        }

        // GET: Admins/Parameters
        public ActionResult Parameters()
        {
            return PartialView("~/Views/Admin/Parameters.cshtml");
        }
        // GET: Admins/ManageUser
        public ActionResult ManageUser()
        {
            return PartialView("~/Views/Admin/ManageUser.cshtml");
        }
        // GET: Admins/OrganizationUnit
        public ActionResult OrganizationUnit()
        {
            return PartialView("~/Views/Admin/OrganizationUnit.cshtml");
        }
        public ActionResult Tree()
        {
            return PartialView("~/Views/Admin/tree.cshtml");
        }
        public ActionResult ManageRole()
        {
            return PartialView("~/Views/Admin/ManageRole.cshtml");
        }
        public ActionResult ExtractData()
        {
            return PartialView();
        }
        // GET: Admins/ManageUser
        public ActionResult ManageNews()
        {
            return PartialView("~/Views/Admin/ManageNews.cshtml");
        }
        
    }
}
