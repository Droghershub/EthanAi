using BTO.Helper;
using BTO.Model;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Modules;
using BTO.Service;
using BTO.Service.Tracking;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Xml.Serialization;
using Microsoft.AspNet.Identity;
using BTO.Service.Payment;

namespace BTO.Controllers
{
    public class HomeController : BTOController
    {
        public IUserSessionService userSessionService { get; set; }
        public IPaymentService paymentService { get; set; }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Paypal()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Paypal(string os0, string cmd, string hosted_button_id)
        {
            if (Session["money"] != null)
            {
                Session["money"] = os0;
            }
            return View();
        }

        public ActionResult PaymentStart(string SubcriptionType, string cmd, string hosted_button_id)
        {
            IDictionary<string, string> subscirtionType = new Dictionary<string, string>();
            subscirtionType.Add("1", "5");
            subscirtionType.Add("2", "10");
            NVPAPICaller payPalCaller = new NVPAPICaller();
            string retMsg = "";
            string token = "";
            Payment payment = new Payment();
            payment.user_id = Guid.Parse(User.Identity.GetUserId());
            payment.subcription_type = SubcriptionType;
            payment.amount = Decimal.Parse(subscirtionType[SubcriptionType]);
            payment.currency_code = "USD";


            Session["payment"] = payment;
            Session["payment_amt"] = subscirtionType[SubcriptionType];

            if (Session["payment_amt"] != null)
            {
                string amt = Session["payment_amt"].ToString();

                bool ret = payPalCaller.ShortcutExpressCheckout(amt, ref token, ref retMsg);
                if (ret)
                {
                    Session["token"] = token;
                    Response.Redirect(retMsg);
                }
                else
                {
                    Response.Redirect("CheckoutError.aspx?" + retMsg);
                }
            }
            else
            {
                Response.Redirect("CheckoutError.aspx?ErrorCode=AmtMissing");
            }
            return View();
        }

        public ActionResult CheckoutReview()
        {
            NVPAPICaller payPalCaller = new NVPAPICaller();

            string retMsg = "";
            string token = "";
            string PayerID = "";
            NVPCodec decoder = new NVPCodec();
            token = Session["token"].ToString();

            bool ret = payPalCaller.GetCheckoutDetails(token, ref PayerID, ref decoder, ref retMsg);
            if (ret)
            {
                Session["payerId"] = PayerID;

                //var myOrder = new Order();
                //myOrder.OrderDate = Convert.ToDateTime(decoder["TIMESTAMP"].ToString());
                //myOrder.Username = User.Identity.Name;
                //myOrder.FirstName = decoder["FIRSTNAME"].ToString();
                //myOrder.LastName = decoder["LASTNAME"].ToString();
                //myOrder.Address = decoder["SHIPTOSTREET"].ToString();
                //myOrder.City = decoder["SHIPTOCITY"].ToString();
                //myOrder.State = decoder["SHIPTOSTATE"].ToString();
                //myOrder.PostalCode = decoder["SHIPTOZIP"].ToString();
                //myOrder.Country = decoder["SHIPTOCOUNTRYCODE"].ToString();
                //myOrder.Email = decoder["EMAIL"].ToString();
                //myOrder.Total = Convert.ToDecimal(decoder["AMT"].ToString());

                // Verify total payment amount as set on CheckoutStart.aspx.
                try
                {
                    decimal paymentAmountOnCheckout = Convert.ToDecimal(Session["payment_amt"].ToString());
                    decimal paymentAmoutFromPayPal = Convert.ToDecimal(decoder["AMT"].ToString());


                    if (paymentAmountOnCheckout != paymentAmoutFromPayPal)
                    {
                        Response.Redirect("CheckoutError.aspx?" + "Desc=Amount%20total%20mismatch.");
                    }
                    ViewBag.paymentAmountOnCheckout = paymentAmountOnCheckout.ToString();
                    ViewBag.paymentAmoutFromPayPal = paymentAmoutFromPayPal.ToString();
                }
                catch (Exception)
                {
                    Response.Redirect("CheckoutError.aspx?" + "Desc=Amount%20total%20mismatch.");
                }
            }
            return View();
        }
        public ActionResult CheckOutCancel()
        {
            return View();
        }
        public ActionResult Process()
        {

            NVPAPICaller payPalCaller = new NVPAPICaller();

            string retMsg = "";
            string token = "";
            string finalPaymentAmount = "";
            string PayerID = "";
            NVPCodec decoder = new NVPCodec();

            token = Session["token"].ToString();
            PayerID = Session["payerId"].ToString();
            finalPaymentAmount = Session["payment_amt"].ToString();

            bool ret = payPalCaller.DoCheckoutPayment(finalPaymentAmount, token, PayerID, ref decoder, ref retMsg);
            if (ret)
            {
                // Retrieve PayPal confirmation value.
                string PaymentConfirmation = decoder["PAYMENTINFO_0_TRANSACTIONID"].ToString();
                //      TransactionId.Text = PaymentConfirmation;
                
                
                ViewBag.PaymentConfirmation = PaymentConfirmation;
                Payment payment = Session["payment"] as Payment;
                if (payment != null)
                {
                    payment.payment_date = DateTime.Now;
                    payment.transaction_id = PaymentConfirmation;
                    payment.begin_date= DateTime.Now;

                    if (payment.subcription_type == "1")
                        payment.end_date = payment.begin_date.AddMonths(1);

                    else if (payment.subcription_type == "2")
                        payment.end_date = payment.begin_date.AddYears(1);

                    paymentService.Create(payment);
                    ViewBag.payment = payment;
                }

                //ProductContext _db = new ProductContext();
                //// Get the current order id.
                //int currentOrderId = -1;
                //if (Session["currentOrderId"] != string.Empty)
                //{
                //    currentOrderId = Convert.ToInt32(Session["currentOrderID"]);
                //}
                //Order myCurrentOrder;
                //if (currentOrderId >= 0)
                //{
                //    // Get the order based on order id.
                //    myCurrentOrder = _db.Orders.Single(o => o.OrderId == currentOrderId);
                //    // Update the order to reflect payment has been completed.
                //    myCurrentOrder.PaymentTransactionId = PaymentConfirmation;
                //    // Save to DB.
                //    _db.SaveChanges();
                //}

                //// Clear shopping cart.
                //using (WingtipToys.Logic.ShoppingCartActions usersShoppingCart =
                //    new WingtipToys.Logic.ShoppingCartActions())
                //{
                //    usersShoppingCart.EmptyCart();
                //}

                // Clear order id.
                Session["currentOrderId"] = string.Empty;
            }
            else
            {
                Response.Redirect("CheckoutError.aspx?" + retMsg);
            }

            return View("Success");
        }
        public ActionResult Cancel()
        {
            return View();
        }

        public ActionResult Success()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult SetCulture(string culture)
        {
            // Validate input
            culture = CultureHelper.GetImplementedCulture(culture);
            // Save culture in a cookie
            HttpCookie cookie = Request.Cookies["_culture"];
            if (cookie != null)
                cookie.Value = culture;   // update cookie value
            else
            {
                cookie = new HttpCookie("_culture");
                cookie.Value = culture;
                cookie.Expires = DateTime.Now.AddYears(1);
            }
            Response.Cookies.Add(cookie);
            return RedirectToAction("Index");
        }
        public ActionResult Main(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/Main.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];

            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;


                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.Main.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return PartialView("~/Views/Home/Main.cshtml");
        }
        public ActionResult IncomeExpenses(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/IncomeExpenses.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;


                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.IncomeExpenses.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return PartialView("~/Views/Home/IncomeExpenses.cshtml");
        }
        public ActionResult About()
        {
            ViewBag.Message = BTO.Resources.Resource.YourDescription;

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = BTO.Resources.Resource.ContactPage;
            return View();
        }

        public ActionResult Country()
        {
            ViewBag.Message = BTO.Resources.Resource.ContactPage;

            return View();
        }

        public ActionResult LiquidIlliquidAsset(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/LiquidIlliquidAsset.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;


                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.LiquidIlliquidAsset.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return PartialView("~/Views/Home/LiquidIlliquidAsset.cshtml");
        }
        public ActionResult IlliquidAsset(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/IlliquidAsset.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;
                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.IlliquidAsset.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return PartialView("~/Views/Home/IlliquidAsset.cshtml");
        }
        public ActionResult RankingDreams(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/RankingDreams.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;

                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.RankingDreams.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return PartialView("~/Views/Home/RankingDreams.cshtml");
        }
        public ActionResult ManageSolution()
        {
            return PartialView("~/Views/Home/ManageSolution.cshtml");
        }
        public ActionResult Error()
        {
            return PartialView("~/Views/Home/Error.cshtml");
        }

        public ActionResult Info()
        {
            return PartialView("~/Views/Home/Info.cshtml");
        }

        public ActionResult ShareScreen(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/ShareScreen.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;


                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.Main.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }
            return PartialView("~/Views/Home/ShareScreen.cshtml");
        }
        public ActionResult Screen()
        {
            return View();
        }

        public ActionResult SharingSession(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/SharingSession.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;

                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.Main.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }

            return PartialView("~/Views/Home/SharingSession.cshtml");
        }

        public ActionResult SharingSessionOnlyView(int? playback)
        {
            if (playback == 1)
                return PartialView("~/Views/Home/SharingSessionOnlyView.cshtml");
            ClientProfile client = (ClientProfile)this.Session["ProfileSession"];
            if (client != null && Request.Cookies["reload"] == null)
            {
                BTO.Common.WebAction.Action action = Common.WebAction.Action.TAB_CLICK;

                BTO.Common.Tab tab = new Common.Tab { Name = Common.WebAction.TabName.Main.ToString() };
                string data = Ultils.ToXML(tab);
                userSessionService.AddUserSession(client.id, action, data);
            }

            return PartialView("~/Views/Home/SharingSessionOnlyView.cshtml");
        }

        public ActionResult KeepAlive()
        {
            return PartialView("~/Views/Home/KeepAlive.cshtml");
        }

        [HttpPost]
        public JsonResult KeepSessionAlive(string id)
        {
            if (User == null || User.Identity == null || !User.Identity.IsAuthenticated)
                return new JsonResult { Data = "false" };
            else
                return new JsonResult { Data = "true" };
        }
    }
}