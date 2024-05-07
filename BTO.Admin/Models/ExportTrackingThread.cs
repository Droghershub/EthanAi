using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading;
using BTO.Service.Tracking;
using System.IO;
using System.IO.Compression;
using BTO.Model.Tracking;
using BTO.Model;
using BTO.Models;
namespace BTO.Admin.Models
{
    public class ExportTrackingThread
    {
        private DateTime start;
        private DateTime end;
        private IClientProfileService iclientProfileServices;
        private string filePath;
        private string serverPath;
        private string email;
        public ExportTrackingThread(DateTime _start, DateTime _end, IClientProfileService _clientServices, string _path, string _serverPath, string _email)
        {
            start = _start;
            end = _end;
            iclientProfileServices = _clientServices;
            filePath = _path;
            serverPath = _serverPath;
            email = _email;
        }
        public void ThreadRun()
        {
            Guid id = Guid.NewGuid();
            int step = 100;
            int index = 0;
            CsvExport<ClientProfileExtract> csv = new CsvExport<ClientProfileExtract>();


            //CsvExport<ClientProfileModel> csv = new CsvExport<ClientProfileModel>(list.ToList());
            if (!System.IO.Directory.Exists(filePath))
            {
                System.IO.Directory.CreateDirectory(filePath);
            }
            string fileName = id.ToString() + ".csv";
            string fileContent = "";
            int old_sessionId = 0;
            using (var memoryStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
                {
                    var demoFile = archive.CreateEntry(id.ToString() + ".csv");

                    using (var entryStream = demoFile.Open())
                    using (var streamWriter = new StreamWriter(entryStream))
                    {
                        while (true)
                        {
                            IEnumerable<ClientProfileModel> data = iclientProfileServices.GetTrackingClientProfilesByThread(start, end, step, index);
                            if (data.Count() > 0)
                            {

                                foreach (ClientProfileModel md in data)
                                {
                                    if (md.SessionId != old_sessionId)
                                    {
                                        IEnumerable<ClientProfileModel> data2 = data.Where(t => t.SessionId == md.SessionId);
                                        List<ClientProfileExtract> real_data = getExtractCsv(data2);

                                        csv.SetObjects(real_data);
                                        fileContent = csv.Export(old_sessionId == 0);
                                        streamWriter.Write(fileContent);

                                        old_sessionId = md.SessionId;
                                    }
                                }

                                index += 1;
                            }
                            else
                                break;
                        }

                    }
                }

                using (var fileStream = new FileStream(filePath + id.ToString() + ".zip", FileMode.Create))
                {
                    memoryStream.Seek(0, SeekOrigin.Begin);
                    memoryStream.CopyTo(fileStream);
                }
            }
            //string body = "Link :<a href='" + serverPath + id.ToString() + ".zip'> Download here";
            string strStartDate = ((DateTime)start).ToString("yyyy-MM-dd");
            string strEndDate = ((DateTime)end).ToString("yyyy-MM-dd");
            // Update Value of Email
            Dictionary<string, string> dictionary = new Dictionary<string, string>()
                                                        {
                                                            {"DOWNLOAD_LINK", serverPath + id.ToString() + ".zip"},
                                                            {"START_DATE", strStartDate},
                                                            {"END_DATE", strEndDate}
                                                        };
            string body = Common.Mail.populateBody(Common.Mail.REPORT_TRACKING_TEMPLATE, dictionary);

            BTO.Common.Mail.Send(email, "Report for Usage Section from " + strEndDate + " to " + strEndDate, body);

        }
        private List<ClientProfileExtract> getExtractCsv(IEnumerable<ClientProfileModel> list)
        {
            List<ClientProfileExtract> result = new List<ClientProfileExtract>();
            BTO.Common.WebAction.Action action;
            bool exceptionOccur = false;

            List<Persona> listPersona = new List<Persona>();
            LoadSessionModel loadmodel = new LoadSessionModel();
            PersonaPlan currentPlan = new PersonaPlan();
            TrackObjectChange obj = new TrackObjectChange();
            foreach (ClientProfileModel md in list)
            {
                exceptionOccur = false;
                ClientProfileExtract ext = new ClientProfileExtract(md);
                Enum.TryParse<BTO.Common.WebAction.Action>(md.actionName, out action);
                switch (action)
                {
                    case Common.WebAction.Action.LOAD_SESSION:
                        try
                        {
                            LoadSessionModel loadsessiontemp = BTO.Common.Utils.DeserializeFromXmlString<LoadSessionModel>(md.data);
                            loadmodel = loadsessiontemp;
                            currentPlan = PersonalPlanModel.ModelToPersonalPlan(loadmodel.PersonalPlanModel);
                            listPersona = loadmodel.ListPersona;
                        }
                        catch (Exception e)
                        {
                            exceptionOccur = true;
                        }

                        break;
                    case Common.WebAction.Action.RESET_PLAN_BUTTON:
                        try
                        {
                            LoadSessionModel resettemp = BTO.Common.Utils.DeserializeFromXmlString<LoadSessionModel>(md.data);
                            loadmodel = resettemp;
                            currentPlan = PersonalPlanModel.ModelToPersonalPlan(loadmodel.PersonalPlanModel);
                            listPersona = loadmodel.ListPersona;
                        }
                        catch (Exception ex)
                        {
                            exceptionOccur = true;
                        }
                        break;
                    case Common.WebAction.Action.CHANGE_CASH_FLOW:
                        Persona ps = BTO.Common.Utils.DeserializeFromXmlString<Persona>(md.data);
                        ext.item_name = ps.variable;
                        ext.data_change = ps.value;
                        Persona cr = listPersona.Where(t => t.variable == ps.variable).FirstOrDefault();
                        if (cr != null)
                        {

                            ext.data = cr.value * 1000 / 12;
                            cr.value = ps.value * 12 / 1000;
                        }

                        break;
                    case Common.WebAction.Action.CHANGE_INVESTMENT_START:
                        Persona ps1 = BTO.Common.Utils.DeserializeFromXmlString<Persona>(md.data);
                        ext.item_name = ps1.variable;
                        ext.data_change = ps1.value;
                        Persona cr1 = listPersona.Where(t => t.variable == ps1.variable).FirstOrDefault();
                        if (cr1 != null)
                        {

                            ext.data = cr1.value;
                            cr1.value = ps1.value;
                        }

                        break;
                    case Common.WebAction.Action.ADD_DREAM:
                        ext.data_change = md.data;
                        Dream dr = DreamModel.getObject(BTO.Common.Utils.DeserializeFromXmlString<DreamModel>(md.data));
                        currentPlan.dreams.Add(dr);
                        break;
                    case Common.WebAction.Action.ADD_LIFEEVENT:
                        ext.data_change = md.data;
                        LifeEvent ev = LifeEventModel.getObject(BTO.Common.Utils.DeserializeFromXmlString<LifeEventModel>(md.data));
                        currentPlan.lifeEvent.Add(ev);
                        break;
                    case Common.WebAction.Action.REMOVE_DREAM:
                        Dream dr1 = DreamModel.getObject(BTO.Common.Utils.DeserializeFromXmlString<DreamModel>(md.data));
                        currentPlan.dreams.Remove(currentPlan.dreams.Where(t => t.id == dr1.id).FirstOrDefault());
                        ext.data_change = md.data;
                        break;
                    case Common.WebAction.Action.REMOVE_LIFEEVENT:
                        ext.data_change = md.data;
                        LifeEvent ev1 = LifeEventModel.getObject(BTO.Common.Utils.DeserializeFromXmlString<LifeEventModel>(md.data));
                        currentPlan.lifeEvent.Remove(currentPlan.lifeEvent.Where(t => t.id == ev1.id).FirstOrDefault());
                        break;
                    case Common.WebAction.Action.EDIT_DREAM:
                    case Common.WebAction.Action.EDIT_LIFEEVENT:
                        ext.data_change = md.data;
                        break;
                    case Common.WebAction.Action.CHANGE_RETIREMENT_AGE:
                    case Common.WebAction.Action.CHANGE_SOCIAL_SECURITY_AGE:
                    case Common.WebAction.Action.CHANGE_START_AGE:
                    case Common.WebAction.Action.CHANGE_RETIREMENT_LIFESTYLE:

                        List<BTO.Model.Tracking.TrackPropertyChange> listPropertyChange = BTO.Common.Utils.DeserializeFromXmlString<List<BTO.Model.Tracking.TrackPropertyChange>>(md.data);
                        if (listPropertyChange != null && listPropertyChange.Count() > 0)
                        {
                            ext.data = listPropertyChange[0].fromvalue;
                            ext.data_change = listPropertyChange[0].tovalue;
                        }
                        break;
                    case Common.WebAction.Action.MOVE_DREAM_PURCHAGE:
                        obj = BTO.Common.Utils.DeserializeFromXmlString<TrackObjectChange>(md.data);
                        Dream moveDream = currentPlan.dreams.Where(t => t.id == obj.id).FirstOrDefault();
                        if (moveDream != null)
                        {
                            ext.item_name = moveDream.name;
                            ext.data = obj.listchange[0].fromvalue;
                            ext.data_change = obj.listchange[0].tovalue;
                        }
                        else
                        {
                            exceptionOccur = true;
                        }

                        break;
                    case Common.WebAction.Action.MOVE_LIFEEVENT_PURCHAGE:
                        obj = BTO.Common.Utils.DeserializeFromXmlString<TrackObjectChange>(md.data);
                        LifeEvent moveLifeevent = currentPlan.lifeEvent.Where(t => t.id == obj.id).FirstOrDefault();
                        if (moveLifeevent != null)
                        {
                            ext.item_name = moveLifeevent.name;
                            ext.data = obj.listchange[0].fromvalue;
                            ext.data_change = obj.listchange[0].tovalue;
                        }
                        else
                        {
                            exceptionOccur = true;
                        }

                        break;
                    default:
                        break;
                }
                if (!GlobalConfig.parametterNeedForceUpdate.ContainsKey(action) && !exceptionOccur)
                {
                    result.Add(ext);
                }

            }
            return result;
        }
    }
}