using BTO.Model;
using BTO.Modules;
using BTO.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
namespace BTO.API
{
    [RoutePrefix("api/dream")]
    public class DreamController : BTOAPIController
    {
        public IDreamTypeService dreamTypeService { get; set; }
        public IDreamService dreamService { get; set; }
        public IDreamTypeConfigService dreamTypeConfigService { get; set; }

        [Route("GET/{user_id:guid}")]
        // GET api/<controller>
        public object Get(Guid user_id)
        {
            List<DreamType> lstDreamType = dreamTypeService.GetAllData();
            List<DreamTypeConfig> listConfig = dreamTypeConfigService.GetAllData();
            foreach (DreamType drType in lstDreamType)
            {
                List<DreamTypeConfig> lst = listConfig.Where(x => x.dream_type_id == drType.id).OrderBy(y=>y.order).ToList();
                //ICollection<DreamTypeConfig> lst = dreamTypeConfigService.GetByDreamTypeId(drType.id);
                drType.dreamTypeConfig = lst;
            }
            Dream dream = new Dream();
            LifeEvent events = new LifeEvent();
            var returnObject = new { dreamtype = lstDreamType,dream = dream,lifeevent = events };
            return returnObject;
        }

    }
}