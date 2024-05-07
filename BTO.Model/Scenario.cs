using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Model
{
    public class Scenario
    {
        public int id { get; set; }
        public System.Guid user_id { get; set; }
        public string name { get; set; }        
        public Nullable<ScenarioType> status { get; set; }
        public string statusDisplay { get; set; }
        public System.DateTime time_create { get; set; }

        public Scenario() {
            id = 0;
            status = 0;
            name = "";
        }
        public Scenario(PersonaPlan personaPlan)
        {
            id = personaPlan.id;
            user_id = personaPlan.user_id;
            name = personaPlan.name;
            status = personaPlan.status;
            statusDisplay = status == null?"":Enum.GetName(typeof(ScenarioType), status);
            time_create = personaPlan.time_create;
        }
    }
    public class ScenarioXml
    {
        public int id { get; set; }
        public System.Guid user_id { get; set; }
        public string name { get; set; }        
        public string statusDisplay { get; set; }
        public System.DateTime time_create { get; set; }
        public static Scenario ToModel(ScenarioXml item)
        {
            ScenarioType type;
            bool isParseSuccess = false;
            
            isParseSuccess = Enum.TryParse(item.statusDisplay,out type);
            return new Scenario()
            {
                id = item.id,
                user_id = item.user_id,
                name = item.name,
                time_create = item.time_create,
                statusDisplay = item.statusDisplay,
                status = isParseSuccess?(ScenarioType?)type:null
            };
        }
        public static ScenarioXml FromModel(Scenario item)
        {
            return new ScenarioXml()
            {
                id = item.id,
                user_id = item.user_id,
                name = item.name,
                time_create = item.time_create,
                statusDisplay = item.status == null?"":Enum.GetName(typeof(ScenarioType), item.status)
            };
        }
        public static List<ScenarioXml> ListFromModel(List<Scenario> list)
        {
            List<ScenarioXml> listmd = new List<ScenarioXml>();
            foreach (Scenario sc in list)
            {
                listmd.Add(FromModel(sc));
            }
            return listmd;
        }
        public static List<Scenario> ListToModel(List<ScenarioXml> list)
        {
            List<Scenario> listmd = new List<Scenario>();
            foreach (ScenarioXml sc in list)
            {
                listmd.Add(ToModel(sc));
            }
            return listmd;
        }
    }
}
