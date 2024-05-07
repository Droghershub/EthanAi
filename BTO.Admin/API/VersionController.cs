using BTO.Model;
using BTO.Modules;
using BTO.Service;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
namespace BTO.Admin.API
{
    [RoutePrefix("api/version")]
    public class VersionController : BTOAPIController
    {
        public IProductVersionService productVersionService { get; set; }

        [Route("get_version")]
        [HttpGet]
        public List<ProductVersion> GetVersion()
        {
            return productVersionService.GetAll().ToList();
        }
    }
}