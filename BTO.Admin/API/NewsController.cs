using BTO.Models;
using BTO.Modules;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Microsoft.AspNet.Identity;
using BTO.Service.Tracking;
using System.Globalization;
using System.Threading;
using System.Web;
using BTO.Model;
using BTO.Service;

namespace BTO.API
{
    [Authorize]
    [RoutePrefix("api/news")]
    public class NewsController : BTOAPIController
    {
        public INewsService newsService { get; set; }
        public INewsOrganizationUnitService newsOrganizationUnitService { get; set; }
        public INewsUserService newsUserService { get; set; }

        [Route("addnews")]
        [HttpPost]
        // GET api/<controller>
        public News AddNews(JObject jsonObj)
        {
            var user_id = System.Web.HttpContext.Current.User.Identity.GetUserId();
            string news_content = (string)jsonObj["news_content"];
            string news_content_en = (string)jsonObj["news_content_en"];
            string news_content_fr = (string)jsonObj["news_content_fr"];
            string news_content_ma = (string)jsonObj["news_content_ma"];
            int opening_time_trigger = (int)jsonObj["opening_time_trigger"];
            int no_activity_time_trigger = (int)jsonObj["no_activity_time_trigger"];
            int prioritization = (int)jsonObj["prioritization"];
            int sequencing = (int)jsonObj["sequencing"];

            DateTime starting_date = (DateTime)jsonObj["starting_date"];
            DateTime expiration_date = (DateTime)jsonObj["expiration_date"];
            News news = new News()
            {
                create_user_id = Guid.Parse("95D51E23-F35B-4CAC-AABE-E60ED9920193"),
                news_content = news_content,
                news_content_en = news_content_en,
                news_content_fr = news_content_fr,
                news_content_ma = news_content_ma,
                opening_time_trigger = opening_time_trigger,
                no_activity_time_trigger = no_activity_time_trigger,
                prioritization = prioritization,
                sequencing = sequencing,
                starting_date = starting_date,
                expiration_date = expiration_date
            };
            newsService.Create(news);
            return news;
        }

        [Route("updatenews")]
        [HttpPost]
        // GET api/<controller>
        public News UpdateNews(JObject jsonObj)
        {
            int id = (int)jsonObj["id"];
            string news_content = (string)jsonObj["news_content"];
            string news_content_en = (string)jsonObj["news_content_en"];
            string news_content_fr = (string)jsonObj["news_content_fr"];
            string news_content_ma = (string)jsonObj["news_content_ma"];
            int opening_time_trigger = (int)jsonObj["opening_time_trigger"];
            int no_activity_time_trigger = (int)jsonObj["no_activity_time_trigger"];
            int prioritization = (int)jsonObj["prioritization"];
            int sequencing = (int)jsonObj["sequencing"];

            DateTime starting_date = (DateTime)jsonObj["starting_date"];
            DateTime expiration_date = (DateTime)jsonObj["expiration_date"];

            News news = newsService.GetById(id);
            news.news_content = news_content;
            news.news_content_en = news_content_en;
            news.news_content_fr = news_content_fr;
            news.news_content_ma = news_content_ma;
            news.opening_time_trigger = opening_time_trigger;
            news.no_activity_time_trigger = no_activity_time_trigger;
            news.prioritization = prioritization;
            news.sequencing = sequencing;
            news.starting_date = starting_date;
            news.expiration_date = expiration_date;

            newsService.Update(news);
            return news;
        }

        [Route("deletenews")]
        [HttpPost]
        // GET api/<controller>
        public bool DeleteNews(JObject jsonObj)
        {
            int id = (int)jsonObj["id"];
            News news = newsService.GetById(id);
            newsService.Delete(news);
            return true;
        }

        [Route("getallnews")]
        [HttpGet]
        // GET api/<controller>
        public List<News> getTrackingClient(JObject jsonObj)
        {

            return newsService.GetAll().ToList();
        }



        [Route("add_news_organization_unit")]
        [HttpPost]
        // GET api/<controller>
        public NewsOrganizationUnit AddNewsOrganizationUnit(JObject jsonObj)
        {
            int news_id = (int)jsonObj["news_id"];
            int organization_unit_id = (int)jsonObj["organization_unit_id"];
            NewsOrganizationUnit newsOrganizationUnit = new NewsOrganizationUnit()
            {
                news_id = news_id,
                organization_unit_id = organization_unit_id               
            };
            newsOrganizationUnitService.Create(newsOrganizationUnit);
            return newsOrganizationUnit;
        }

        [Route("update_news_organization_unit")]
        [HttpPost]
        // GET api/<controller>
        public bool DeleteNewsOrganizationUnit(JObject jsonObj)
        {
            int news_id = (int)jsonObj["news_id"];
            int organization_unit_id = (int)jsonObj["organization_unit_id"];
            NewsOrganizationUnit newsOrganizationUnit = newsOrganizationUnitService.GetByNewIdAndOrganizationUnitId(news_id, organization_unit_id);            
            newsOrganizationUnitService.Delete(newsOrganizationUnit);
            return true;
        }

        [Route("add_news_user")]
        [HttpPost]
        // GET api/<controller>
        public NewsUser AddNewsUser(JObject jsonObj)
        {
            int news_id = (int)jsonObj["news_id"];
            string user_id = (string)jsonObj["user_id"];
            NewsUser newsUser = new NewsUser()
            {
                news_id = news_id,
                user_id = user_id
            };
            newsUserService.Create(newsUser);
            return newsUser;
        }

        [Route("update_news_user")]
        [HttpPost]
        // GET api/<controller>
        public bool DeleteNewsUser(JObject jsonObj)
        {
            int news_id = (int)jsonObj["news_id"];
            string user_id = (string)jsonObj["user_id"];
            NewsUser newsUser = newsUserService.GetByNewIdAndUserId(news_id, user_id);
            newsUserService.Delete(newsUser);
            return true;
        }

        [Route("get_news_list/{userId}")]
        [HttpGet]
        // GET api/<controller>
        public List<News> GetNewsList(string userId)
        {
            return newsService.GetNewsByUserId(userId);
           
        }
    }
}
