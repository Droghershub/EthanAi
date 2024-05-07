using BTO.Common;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace BTO.Common
{
    public class MultiLanguage
    {
        public static Dictionary<string, JObject> languages = new Dictionary<string, JObject>();

        public MultiLanguage()
        {

        }

        public static void LoadLanguage()
        {

            using (StreamReader file = File.OpenText(System.AppDomain.CurrentDomain.BaseDirectory + "Content/translates/en.json"))
            using (JsonTextReader reader = new JsonTextReader(file))
            {
                JObject o = (JObject)JToken.ReadFrom(reader);
                languages.Add("en", o);
            }


            using (StreamReader file = File.OpenText(System.AppDomain.CurrentDomain.BaseDirectory + "Content/translates/fr.json"))
            using (JsonTextReader reader = new JsonTextReader(file))
            {
                JObject o = (JObject)JToken.ReadFrom(reader);
                languages.Add("fr", o);
            }


        }

        public static string GetText(string lang, string key)
        {
            if (languages.ContainsKey(lang))
                return languages[lang].Value<string>(key);
            else
                return key;
        }
    }
}