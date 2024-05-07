using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Configuration;
using System.IO;
namespace BTO.Common
{
    public class Mail
    {
        public static string REGISTER_ACCOUNT_TEMPLATE = String.Empty;
        public static string CONFIRM_ACCOUNT_TEMPLATE = String.Empty;
        public static string RESET_PASSWORD_TEMPLATE = String.Empty;
        public static string REPORT_TRACKING_TEMPLATE = String.Empty;

        public static void initEmailTemplate() {
            
            // Register Account
            if (File.Exists(HttpContext.Current.Server.MapPath("~/EmailTemplates/RegisterAccount.html")))
            {
                using (System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Server.MapPath("~/EmailTemplates/RegisterAccount.html")))
                {
                    string body = reader.ReadToEnd();
                    REGISTER_ACCOUNT_TEMPLATE = body;
                } 
            }
                       

            // CONFIRM Account
            if (File.Exists(HttpContext.Current.Server.MapPath("~/EmailTemplates/ConfirmAccount.html")))
            {
                using (System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Server.MapPath("~/EmailTemplates/ConfirmAccount.html")))
                {
                    string body = reader.ReadToEnd();
                    CONFIRM_ACCOUNT_TEMPLATE = body;
                }
            }
            // RESET PASSWORD 
            if (File.Exists(HttpContext.Current.Server.MapPath("~/EmailTemplates/ResetPassword.html")))
            {
                using (System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Server.MapPath("~/EmailTemplates/ResetPassword.html")))
                {
                    string body = reader.ReadToEnd();
                    RESET_PASSWORD_TEMPLATE = body;
                }
            }
            // REPORT_TRACKING_TEMPLATE
            if (File.Exists(HttpContext.Current.Server.MapPath("~/EmailTemplates/ReportTracking.html")))
            {
                using (System.IO.StreamReader reader = new System.IO.StreamReader(HttpContext.Current.Server.MapPath("~/EmailTemplates/ReportTracking.html")))
                {
                    string body = reader.ReadToEnd();
                    REPORT_TRACKING_TEMPLATE = body;
                }
            }
            
        }

        public static string populateBody(string body, Dictionary<string, string> dictionary)
        {
            
            string result = string.Copy(body);
            foreach (var pair in dictionary) {
                result = result.Replace("{{" + pair.Key + "}}", pair.Value);
            }           

            return result;
        }

        public static bool Send(string _mail, string title, string body)
        {
            try
            {
                string smtpServer = WebConfigurationManager.AppSettings["SmtpServer"].ToString();
                string smtpPort = WebConfigurationManager.AppSettings["SmtpPort"].ToString();
                string smtpEmail = WebConfigurationManager.AppSettings["SmtpEmail"].ToString();
                string smtpPassword = WebConfigurationManager.AppSettings["SmtpPassword"].ToString();
                string smtpEnableSsl = WebConfigurationManager.AppSettings["SmtpEnableSsl"].ToString();
                if (!string.IsNullOrEmpty(smtpServer) && !string.IsNullOrEmpty(smtpPort) && !string.IsNullOrEmpty(smtpEmail) && !string.IsNullOrEmpty(smtpPassword) && !string.IsNullOrEmpty(smtpEnableSsl))
                {

                    MailMessage mail = new MailMessage();
                    SmtpClient SmtpServer = new SmtpClient(smtpServer);
                    mail.From = new MailAddress(smtpEmail, "ZYMI");
                    mail.To.Add(_mail);                  
                    mail.Subject = title;
                    mail.Body = body;
                    mail.IsBodyHtml = true;               
                   
                    SmtpServer.UseDefaultCredentials = false;
                    SmtpServer.Credentials = new System.Net.NetworkCredential(smtpEmail, smtpPassword);
                    SmtpServer.Port = Int32.Parse(smtpPort);
                    SmtpServer.EnableSsl = Boolean.Parse(smtpEnableSsl);
                    SmtpServer.Timeout = 60000;
                    SmtpServer.Send(mail);
                    return true;
                }
                return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}
