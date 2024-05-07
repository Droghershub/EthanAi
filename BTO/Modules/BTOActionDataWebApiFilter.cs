using BTO.Model;
using BTO.Model.Tracking;
using BTO.Models;
using BTO.Service.Tracking;
using BTO.Service;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using System.Web.Mvc;
namespace BTO.Modules
{
    public class BTOActionDataWebApiFilter : System.Web.Http.Filters.ActionFilterAttribute
    {
        public override void OnActionExecuting(HttpActionContext actionContext)
        {
            if (SystemTrackingLevelManagement.Instance.IsEnableTracking == true)
            {
                try
                {
                    var trackingSerivce = DependencyResolver.Current.GetService<IPlanTrackingService>();
                    if (actionContext.Request.Method == HttpMethod.Post)
                    {
                        var postData = actionContext.ActionArguments;
                        var objectData = postData.First().Value;
                        PersonaPlan data = objectData as PersonaPlan;
                        /*if (data != null && data.ClientActionType != null)
                        {
                            BTOActionWebApiFilter api = new BTOActionWebApiFilter()
                            {
                                ClientActionType = data.ClientActionType
                            };
                            api.OnActionExecuting(actionContext);
                        }
                        */
                        PersonalPlanTracking client;
                        PersonalPlanModel model;
                        if (objectData is PersonaPlan)
                        {
                            model = PersonalPlanModel.Copy(data);
                            client = new PersonalPlanTracking()
                            {
                                level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                                time_create = DateTime.Now,
                                action_type = typeof(PersonaPlan).Name,
                                user_id = data.user_id,
                                serialized_data = Ultils.ToXML(model)
                            };
                            trackingSerivce.Tracking(client);
                        }
                        else if (objectData is Dream)
                        {
                            var planService = DependencyResolver.Current.GetService<IPersonaPlanService>();
                            Dream dream = objectData as Dream;
                            data = planService.GetById(dream.persona_plan_id);
                            PersonaPlan temp = new PersonaPlan(data);
                            temp.dreams.Add(dream);
                            //data.dreams.Add(dream);                            
                            model = PersonalPlanModel.Copy(temp);
                            client = new PersonalPlanTracking()
                            {
                                level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                                time_create = DateTime.Now,
                                action_type = actionContext.ActionDescriptor.ActionName,
                                user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString(), 0)),
                                serialized_data = Ultils.ToXML(model)
                            };
                            trackingSerivce.Tracking(client);

                        }
                        else if (objectData is LifeEvent)
                        {
                            var planService = DependencyResolver.Current.GetService<IPersonaPlanService>();
                            LifeEvent lifeEvent = objectData as LifeEvent;
                            data = planService.GetById(lifeEvent.persona_plan_id);
                            PersonaPlan temp = new PersonaPlan(data);
                            temp.lifeEvent.Add(lifeEvent);

                            model = PersonalPlanModel.Copy(temp);
                            client = new PersonalPlanTracking()
                            {
                                level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                                time_create = DateTime.Now,
                                action_type = actionContext.ActionDescriptor.ActionName,
                                user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString(), 0)),
                                serialized_data = Ultils.ToXML(model)
                            };
                            trackingSerivce.Tracking(client);
                        }


                    }
                }
                catch (Exception ex)
                {
                    var exceptionService = DependencyResolver.Current.GetService<ILogExceptionService>();
                    LogException log = new LogException()
                    {
                        level_track_id = SystemTrackingLevelManagement.Instance.LevelTracking,
                        Type = actionContext.ActionDescriptor.ActionName,
                        user_id = Guid.Parse(Ultils.GetValueFromStringByRegexFormat(actionContext.Request.Headers.First(t => t.Key == Contrainst.Cookie).Value.First<String>().ToString(), 0)),
                        time_create = DateTime.Now,
                        message = ex.Message.ToString() + ex.StackTrace.ToString(),
                    };
                    exceptionService.AddLog(log);
                }
            }
        }
    }
}