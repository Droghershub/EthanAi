using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BTO.Models
{
    public class ClientProfileModel
    {
        public int SessionId { get; set; }
        public string IP { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public Guid UserId { get; set; }
        public DateTime DateTime { get; set; }
        public DateTime EndTime { get; set; }
        public string UserAgent { get; set; }
        public string UrlReferrer { get; set; }
        public string Userlanguages { get; set; }

        public string Browser { get; set; }
        public string BrowserVersion { get; set; }
        public string BrowserPlatform { get; set; } 
        public string UIVersion { get; set; }
        public string actionName { get; set; }
        public string data { get; set; }
  //      public string SessionId { get; set; } 
    }
    public class ClientProfileExtract
    {
        public int SessionId { get; set; }
        public string IP { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public Guid UserId { get; set; }
        public DateTime DateTime { get; set; }
        public DateTime EndTime { get; set; }
        public string UserAgent { get; set; }
        public string UrlReferrer { get; set; }
        public string Userlanguages { get; set; }

        public string Browser { get; set; }
        public string BrowserVersion { get; set; }
        public string BrowserPlatform { get; set; }
        public string UIVersion { get; set; }
        public string actionName { get; set; }
        public string item_name { get; set; }
        public object data { get; set; }
        public object data_change { get; set; }

        public ClientProfileExtract(ClientProfileModel model)
        {
            SessionId = model.SessionId;
            IP = model.IP;
            Email = model.Email;
            Name = model.Name;
            UserId = model.UserId;
            DateTime = model.DateTime;
            EndTime = model.EndTime;
            UserAgent = model.UserAgent;
            UrlReferrer = model.UrlReferrer;
            Userlanguages = model.Userlanguages;
            Browser = model.Browser;
            BrowserVersion = model.BrowserVersion;
            BrowserPlatform = model.BrowserPlatform;
            UIVersion = model.UIVersion;
            actionName = model.actionName;


        }
        //      public string SessionId { get; set; } 
    }
}