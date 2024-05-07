using Hammock.Serialization;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Configuration;
using System.Web.Script.Serialization;

namespace BTO.Models
{

    [DataContract]
    public class Rule : ICloneable
    {
        [DataMember]
        public Dictionary<string, object> parameter { get; set; }
        [DataMember]
        public List<Income> parameter_config { get; set; }
        [DataMember]
        public List<CPF> cpf { get; set; }
        [DataMember]
        public List<Income> income { get; set; }
        [DataMember]
        public List<Expense> expense { get; set; }
        [DataMember]
        public List<Income> investment_start { get; set; }
        [DataMember]
        public Dictionary<string, bool> formula_parameter { get; set; }
        public object Clone()
        {
            var copy =  this.MemberwiseClone();
            var json = JsonConvert.SerializeObject(copy);
            return JsonConvert.DeserializeObject<Rule>(json);
        }        
    }

    //[DataContract]
    //public class Parameter
    //{
    //    [DataMember]
    //    Dictionary<string, object> parameter { get; set; }
    //}

    [DataContract]
    public class CPF
    {
        [DataMember]
        public String name { get; set; }
        [DataMember]
        public Decimal value { get; set; }
        [DataMember]
        public Decimal default_value { get; set; }
        [DataMember]
        public Boolean isSummable { get; set; }
        [DataMember]
        public Boolean isFormula { get; set; }
        [DataMember]
        public Boolean is_choose_formula { get; set; }
        [DataMember]
        public Boolean isPosistive { get; set; }
        [DataMember]
        public List<CPF> children { get; set; }
    }

    [DataContract]
    public class Income
    {
        [DataMember]
        public String name { get; set; }
        [DataMember]
        public Decimal value { get; set; }
        [DataMember]
        public Decimal default_value { get; set; }
        [DataMember]
        public Boolean isSummable { get; set; }
        [DataMember]
        public Boolean isFormula { get; set; }
        [DataMember]
        public Boolean is_choose_formula { get; set; }
        [DataMember]
        public Boolean isPosistive { get; set; }
        [DataMember]
        public List<Income> children { get; set; }
    }
    [DataContract]
    public class Expense
    {
        [DataMember]
        public String name { get; set; }
        [DataMember]
        public Decimal value { get; set; }
        [DataMember]
        public Decimal default_value { get; set; }
        [DataMember]
        public Boolean isSummable { get; set; }
        [DataMember]
        public Boolean isFormula { get; set; }
        [DataMember]
        public Boolean is_choose_formula { get; set; }
        [DataMember]
        public Boolean isPosistive { get; set; }
        [DataMember]
        public List<Expense> children { get; set; }
    }

    public class ConfigRule
    {
        public static void Load(int id)
        {
            string APIJavaEngine = WebConfigurationManager.AppSettings["APIJavaEngine"].ToString() + "/getRuleConfig?nationallity=1";
            var syncClient = new WebClient();
            Rule data = null;
            for (int i = 0; i < 5; i++)
            {
                try
                {
                    var content = syncClient.DownloadString(APIJavaEngine);


                    JavaScriptSerializer javaScriptSerializer = new JavaScriptSerializer();
                    var jsonObject = javaScriptSerializer.Deserialize<dynamic>(content);
                    dynamic parameter = (dynamic)jsonObject["parameter"];


                    DataContractJsonSerializer serializer = new DataContractJsonSerializer(typeof(Rule));
                    data = new Rule();
                    using (var ms = new MemoryStream(Encoding.Unicode.GetBytes(content)))
                    {
                        // deserialize the JSON object using the WeatherData type.
                        data = (Rule)serializer.ReadObject(ms);
                        data.parameter = (Dictionary<string, object>)parameter;
                    }
                    
                    if (GlobalConfig.rules.ContainsKey(id))
                    {
                        GlobalConfig.rules[id] = data;
                    }
                    else
                    {
                        GlobalConfig.rules.Add(id, data);
                    }
                }
                catch (Exception)
                {

                }
                if (data != null)
                    break;
            }
        }
    }
}