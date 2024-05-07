using BTO.Model;
using BTO.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;

namespace BTO.Helper
{
    public class RegisterHelper
    {
        private IUserProfileService userProfileService = DependencyResolver.Current.GetService<IUserProfileService>();
        public IProductVersionService _productVersionService = DependencyResolver.Current.GetService<IProductVersionService>();
        private IParameterService parameterService = DependencyResolver.Current.GetService<IParameterService>();
        public String GetUser(HttpRequest request)
        {
            string username = (GetIP(request) + "_" + GetUserPlatform(request) + "_" + DateTime.Now.ToLongTimeString() + "_" + DateTime.Now.Ticks);
            username = Regex.Replace(username, "[^0-9A-Za-z_]+", "");
            return username.ToLower() + "@test.com";
        }

        public string GetIP(HttpRequest request)
        {
            var ip = request.ServerVariables["HTTP_X_FORWARDED_FOR"];
            if (!string.IsNullOrEmpty(ip))
            {
                string[] ipRange = ip.Split(',');
                int le = ipRange.Length - 1;
                string trueIP = ipRange[le];
            }
            else
            {
                ip = request.ServerVariables["REMOTE_ADDR"];
            }
            return ip; 
        }

        public String GetUserEnvironment(HttpRequest request)
        {
            var browser = request.Browser;
            var platform = GetUserPlatform(request);
            return string.Format("{0} {1} / {2}", browser.Browser, browser.Version, platform);
        }

      
        public String GetUserPlatform(HttpRequest request)
        {
            var ua = request.UserAgent;

            if (ua.Contains("Android"))
                return string.Format("Android_{0}", GetMobileVersion(ua, "Android"));

            if (ua.Contains("iPad"))
                return string.Format("iPad_{0}", GetMobileVersion(ua, "OS"));

            if (ua.Contains("iPhone"))
                return string.Format("iPhone_{0}", GetMobileVersion(ua, "OS"));

            if (ua.Contains("Linux") && ua.Contains("KFAPWI"))
                return "Kindle Fire";

            if (ua.Contains("RIM Tablet") || (ua.Contains("BB") && ua.Contains("Mobile")))
                return "Black Berry";

            if (ua.Contains("Windows Phone"))
                return string.Format("Windows Phone {0}", GetMobileVersion(ua, "Windows Phone"));

            if (ua.Contains("Mac OS"))
                return "Computer_Mac OS";

            if (ua.Contains("Windows NT 5.1") || ua.Contains("Windows NT 5.2"))
                return "Computer_Windows XP";

            if (ua.Contains("Windows NT 6.0"))
                return "Computer_Windows Vista";

            if (ua.Contains("Windows NT 6.1"))
                return "Computer_Windows 7";

            if (ua.Contains("Windows NT 6.2"))
                return "Computer_Windows 8";

            if (ua.Contains("Windows NT 6.3"))
                return "Computer_Windows 8.1";

            if (ua.Contains("Windows NT 10"))
                return "Computer_Windows 10";

            //fallback to basic platform:
            return (ua.Contains("Mobile") ? " Mobile_" : "Computer_") + request.Browser.Platform;
        }

        public String GetMobileVersion(string userAgent, string device)
        {
            var temp = userAgent.Substring(userAgent.IndexOf(device) + device.Length).TrimStart();
            var version = string.Empty;

            foreach (var character in temp)
            {
                var validCharacter = false;
                int test = 0;

                if (Int32.TryParse(character.ToString(), out test))
                {
                    version += character;
                    validCharacter = true;
                }

                if (character == '.' || character == '_')
                {
                    version += '.';
                    validCharacter = true;
                }

                if (validCharacter == false)
                    break;
            }

            return version;
        }

        public UserProfile CreateProfile(Guid user_id, string email, int _c_household_size)
        {
            ProductVersion _prversion = _productVersionService.GetByUserId(user_id.ToString());
            Dictionary<string, object> parameter = GlobalConfig.GetParameter(_prversion.id, parameterService);
			

           
            UserProfile user = userProfileService.GetByUserId(user_id);           
            if (user == null)
            {
                user = new UserProfile();
                //int _c_household_size = Convert.ToInt32(parameter["_c_household_size"]);
                int _c_gender_main = Convert.ToInt32(parameter["_c_gender_main"]);
                int _c_occupation_main = Convert.ToInt32(parameter["_c_occupation_main"]);
                int _c_age_main = Convert.ToInt32(parameter["_c_age_main"]);



                int _c_age_child_1 = Convert.ToInt32(parameter["_c_age_child_1"]);
                int _c_age_child_2 = Convert.ToInt32(parameter["_c_age_child_2"]);
                int _c_age_child_3 = Convert.ToInt32(parameter["_c_age_child_3"]);
                int _c_age_child_4 = Convert.ToInt32(parameter["_c_age_child_4"]);


                int _c_gender_child_1 = Convert.ToInt32(parameter["_c_gender_child_1"]);
                int _c_gender_child_2 = Convert.ToInt32(parameter["_c_gender_child_2"]);
                int _c_gender_child_3 = Convert.ToInt32(parameter["_c_gender_child_3"]);
                int _c_gender_child_4 = Convert.ToInt32(parameter["_c_gender_child_4"]);

                int _c_age_spouse = Convert.ToInt32(parameter["_c_age_spouse"]);
                int _c_gender_spouse = Convert.ToInt32(parameter["_c_gender_spouse"]);
                int _c_occupation_spouse = Convert.ToInt32(parameter["_c_occupation_spouse"]);


                user.email = email;
                user.user_login_id = user_id;
                if (user.gender == null || user.gender == 0)
                    user.gender = _c_gender_main;
                user.age = _c_age_main;
                user.occupation = _c_occupation_main;
                user.nationality = "SGP";
                user.residency_status = 0;
                if (string.IsNullOrEmpty(user.first_name))
                    user.first_name = null;
                if (string.IsNullOrEmpty(user.last_name))
                    user.last_name = null;

                if (_c_household_size == 3)
                {                

                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });                    
                }
                else if (_c_household_size == 4)
                {
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_2, gender = _c_gender_child_2 });
                }
                else if (_c_household_size == 5)
                {
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_2, gender = _c_gender_child_2 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_3, gender = _c_gender_child_3 });
                }
                else if (_c_household_size == 6)
                {
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_1, gender = _c_gender_child_1 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_2, gender = _c_gender_child_2 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_3, gender = _c_gender_child_3 });
                    user.dependent.Add(new UserProfileDependent() { age = _c_age_child_4, gender = _c_gender_child_4 });
                }

                user.spouse_first_name = null;
                user.spouse_last_name = null;
                if (_c_household_size >= 2)
                {
                    user.married_status = 1;
                    user.spouse_gender = _c_gender_spouse;
                    user.spouse_age = _c_age_spouse;
                    user.spouse_occupation = _c_occupation_spouse;
                    user.spouse_nationality = "SGP";
                    user.spouse_residency_status = 0;
                }
                user.viewed_tutorial = false;
                user.is_auto_register = true;
                userProfileService.Create(user);
               
                return user;
            }
            return user;
        }
    }
}