using BTO.Model;
using BTO.Service;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Diagnostics;
using Microsoft.AspNet.Identity;
using Autofac.Integration.Mvc;
using Autofac;
using BTO.Service.Tracking;
using BTO.Common;
using System.Collections;
namespace BTO.ShareScreen
{
    public class GroupHub
    {
        public Guid GroupId { get; set; }
        public bool Active { get; set; }

    }

    public class ControllerHub : Hub
    {
        private readonly ILifetimeScope _hubLifetimeScope;
        public IConnectionService connectionService { get; set; }
        public IGroupService groupService { get; set; }
        public IMemberService memberService { get; set; }
        public IParameterService parameterService { get; set; }

        private static Dictionary<string, List<string>> _viewers = new Dictionary<string, List<string>>();

        private static Dictionary<string, int> _user_reconnect = new Dictionary<string, int>();
        private static ArrayList _user_prepareDisconnect = new ArrayList();
        
        public ControllerHub()
        {
            
        }
        public ControllerHub(ILifetimeScope lifetimeScope)
        {
            _hubLifetimeScope = lifetimeScope.BeginLifetimeScope();
            connectionService = _hubLifetimeScope.Resolve<IConnectionService>();
            groupService = _hubLifetimeScope.Resolve<IGroupService>();
            memberService = _hubLifetimeScope.Resolve<IMemberService>();
        }

        
        protected override void Dispose(bool disposing)
        {
            if (disposing && _hubLifetimeScope != null)
                _hubLifetimeScope.Dispose();

            base.Dispose(disposing);
        }

        public override Task OnConnected() //override OnConnect, OnReconnected and OnDisconnected to know if a user is connected or disconnected
        {
            DateTime now = DateTime.Now;
            string username = Context.User.Identity.GetUserName();
            if (_user_reconnect.ContainsKey(username))
                _user_reconnect[username] = _user_reconnect[username] + 1;
            else
                _user_reconnect.Add(username, 1);
            if (!string.IsNullOrEmpty(username))
            {
                List<Connection> beforeConnections = connectionService.GetByEmail(username);
                if (beforeConnections != null)
                {
                    foreach (Connection beforeConnection in beforeConnections)
                    {
                        connectionService.Delete(beforeConnection);                        
                    }
                }


                Connection connection = new Connection();
                connection.email = username;
                connection.connection_id = Guid.Parse(Context.ConnectionId);
                connection.time_online = now;
                connectionService.Create(connection);

                //If connection existed on database, then update time and new connection id                    
                if (!string.IsNullOrEmpty(username))
                {
                    Group group = groupService.GetGroupAreProcessingByEmail(username);
                    if (group != null)
                    {
                        //if user is refreshing page is presenter
                        Clients.Client(Context.ConnectionId).pageRefreshed(true, group.owner_takeover);
                    }
                    else if (memberService.IsMemberAreListening(username))
                    {
                        //if user is refreshing page is viewer normal
                        Member member = memberService.GetByEmail(username);                        
                        if (member != null)
                        {
                            Group thegroup = groupService.GetById(member.group_id);
                            Clients.Client(Context.ConnectionId).pageRefreshed(false, thegroup.owner_takeover);
                        }                            
                    }
                    else
                        Clients.Caller.newSession();
                }

                //If is user normal;
                string mail = Context.User.Identity.GetUserName();
                string groupOwnerMail = memberService.GetEmailOfGroupOwner(mail);
                if (!string.IsNullOrEmpty(groupOwnerMail))
                {
                    List<Connection> connections = connectionService.GetByEmail(groupOwnerMail);
                    foreach (Connection _connection in connections)
                        if (_connection != null && Context.ConnectionId != _connection.connection_id.ToString())
                            Clients.Client(_connection.connection_id.ToString()).addViewerList(mail);
                }

                // Request and anounce to presenter to reupdate list of viewer
                this.requestUpdateConnectionIdsToSharing(false);
            }


            return base.OnConnected();
        }

        public override Task OnReconnected() //override OnConnect, OnReconnected and OnDisconnected to know if a user is connected or disconnected
        {
            DateTime now = DateTime.Now;
            string username = Context.User.Identity.GetUserName();
            if (_user_reconnect.ContainsKey(username))
                _user_reconnect[username] = _user_reconnect[username] + 1;
            else
                _user_reconnect.Add(username, 1);
            if (!string.IsNullOrEmpty(username))
            {
                List<Connection> beforeConnections = connectionService.GetByEmail(username);
                if (beforeConnections != null)
                {
                    foreach (Connection beforeConnection in beforeConnections)
                    {
                        connectionService.Delete(beforeConnection);
                    }
                }


                Connection connection = new Connection();
                connection.email = username;
                connection.connection_id = Guid.Parse(Context.ConnectionId);
                connection.time_online = now;
                connectionService.Create(connection);

                //If connection existed on database, then update time and new connection id                    
                if (!string.IsNullOrEmpty(username))
                {
                    Group group = groupService.GetGroupAreProcessingByEmail(username);
                    if (group != null)
                    {
                        //if user is refreshing page is presenter
                        Clients.Client(Context.ConnectionId).pageRefreshed(true, group.owner_takeover);
                    }
                    else if (memberService.IsMemberAreListening(username))
                    {
                        //if user is refreshing page is viewer normal
                        Member member = memberService.GetByEmail(username);
                        if (member != null)
                        {
                            Group thegroup = groupService.GetById(member.group_id);
                            Clients.Client(Context.ConnectionId).pageRefreshed(false, thegroup.owner_takeover);
                        }
                    }
                    else
                        Clients.Caller.newSession();
                }

                //If is user normal;
                string mail = Context.User.Identity.GetUserName();
                string groupOwnerMail = memberService.GetEmailOfGroupOwner(mail);
                if (!string.IsNullOrEmpty(groupOwnerMail))
                {
                    List<Connection> connections = connectionService.GetByEmail(groupOwnerMail);
                    foreach (Connection _connection in connections)
                        if (_connection != null && Context.ConnectionId != _connection.connection_id.ToString())
                            Clients.Client(_connection.connection_id.ToString()).addViewerList(mail);
                }

                // Request and anounce to presenter to reupdate list of viewer
                this.requestUpdateConnectionIdsToSharing(false);
            }
           
            return base.OnReconnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            DateTime now = DateTime.Now;
            int count = 0;
            bool endSharing = true;
                     

            if (_user_reconnect.ContainsKey(Context.User.Identity.GetUserName()))
                _user_reconnect[Context.User.Identity.GetUserName()] = _user_reconnect[Context.User.Identity.GetUserName()] - 1;
            while (count++ < 60)
            {

                if (_user_reconnect.ContainsKey(Context.User.Identity.GetUserName()) && _user_reconnect[Context.User.Identity.GetUserName()] >= 1)
                {
                    endSharing = false;
                    break;
                }
                System.Threading.Thread.Sleep(1000);
            }

            if (endSharing)
            {
                Connection connection = connectionService.GetByConnectionId(Guid.Parse(Context.ConnectionId));
                if (connection != null)
                {
                    connectionService.Delete(connection);
                }
             
                this.endSharing();
            }
            
            return base.OnDisconnected(stopCalled);
        } 
        public void sendNotify(string parameter,string parameterId, string product_version_id)
        {
            if (GlobalConfig.parametterNeedForceUpdate.ContainsValue(parameter))
            {
                Dictionary<string, object> parameters = GlobalConfig.GetParametterNeedForceUpdate(Int32.Parse(product_version_id), parameterService);
                Clients.All.updateParameter(product_version_id, parameter, parameters[parameter]);
            }
            else if (parameter.Contains("rule_"))
            {
                Clients.All.updateParameterFormula(product_version_id, parameterId);
            }
        }


        private void requestUpdateConnectionIdsToSharing(bool userManualStop)
        {
            string mail = Context.User.Identity.GetUserName();
            string groupOwnerMail = memberService.GetEmailOfGroupOwner(mail);
            if (!string.IsNullOrEmpty(groupOwnerMail))
            {
                this.updateConnectionIdsToSharing(groupOwnerMail, userManualStop);
                //List<Connection> cons = connectionService.GetByEmail(groupOwnerMail);
                //foreach (Connection con in cons)
                //if (con != null && Context.ConnectionId != con.connection_id.ToString())
                //    Clients.Client(con.connection_id.ToString()).viewerChanged(groupOwnerMail, userManualStop);
            }

        }

        public void updateConnectionIdsToSharing(string groupOwnerMail, bool userManualStop)
        {
            Group group = groupService.GetGroupByEmail(groupOwnerMail);
            if (group != null)
            {
                List<string> members = memberService.GetAllMemberGroup(groupOwnerMail, group.id);
                List<Guid> connections = connectionService.GetAllConnection(members);
                List<string> connections_string = new List<string>();
                foreach (Guid connection in connections)
                {
                    connections_string.Add(connection.ToString());
                }
                _viewers.Remove(groupOwnerMail);
                _viewers.Add(groupOwnerMail, connections_string);
            }

            //if have only one people on sharing, then end sharing
            if (userManualStop == true && (_viewers[groupOwnerMail] == null || _viewers[groupOwnerMail].Distinct().Count() <= 1))
            {
                List<string> cons = connectionService.GetByEmail(groupOwnerMail).Select(x=>x.connection_id.ToString()).ToList();
                Clients.Clients(cons).sharingEndedAtPresenter();                
            }
        }

        public void pageRefreshing(object obj)
        {
            if (obj != null)
            {
                string username = Context.User.Identity.GetUserName();
                if (!string.IsNullOrEmpty(username))
                {
                    Group group = groupService.GetGroupAreProcessingByEmail(username);
                    if (group != null)
                    {
                        //if user is refreshing page is presenter
                        Clients.Client(Context.ConnectionId).pageRefreshed(true);
                    }
                    else if (memberService.IsMemberAreListening(username))
                    {
                        //if user is refreshing page is viewer normal
                        Clients.Client(Context.ConnectionId).pageRefreshed(false);
                    }
                }
                this.requestUpdateConnectionIdsToSharing(false);
            }
        }

        public void newPageOpening()
        {
            //If user is owner of group
            Group group = groupService.GetGroupByEmail(Context.User.Identity.GetUserName());
            if (group != null)
            {
                //Remove all members on group
                memberService.RemoveAllMemberGroup(group.id);
                //Delete group
                groupService.DeleteGroup(Context.User.Identity.GetUserName());
            }
            //If user is member normal
            memberService.RemoveMemberGroup(Context.User.Identity.GetUserName());
        }


        public void requestTakeOver(string owner, string meId)
        {
            Group group = groupService.GetGroupByOwner(owner);
            string me = Context.User.Identity.GetUserName(); 
            if (me == group.owner)
            {
                List<string> connection = connectionService.GetByEmail(me).Select(x => x.connection_id.ToString()).ToList();
                Clients.Clients(connection).takeOverAccepted(true, true);
                this.dialogHide();
                // this.takeOverSharing(meId, owner);
            }
            else
            {
                if (group != null && !string.IsNullOrEmpty(group.owner_takeover))
                {
                    List<Connection> cons = connectionService.GetByEmail(group.owner_takeover);
                    if (cons.Count > 0)
                    {
                        Clients.Clients(cons.Select(t => t.connection_id.ToString()).ToList<string>()).takeOverRequested(me, group.owner_takeover);
                    }
                }
            }
        }

        public void acceptRequestTakeOver(string viewer, bool accept, string owner_takeover)
        {
            if (!string.IsNullOrEmpty(viewer))
            {
                List<Connection> cons = connectionService.GetByEmail(viewer);
                Clients.Clients(cons.Select(t => t.connection_id.ToString()).ToList<string>()).takeOverAccepted(accept, false, owner_takeover);
                this.dialogHide();
            }
        }
        public void CloseAnotherTabViewerTakeOver(string viewer, string dialogId)
        {
            if(!string.IsNullOrEmpty(viewer)){
                IList<Connection> cons = connectionService.GetByEmail(viewer);
                IList<string> conIds = cons.Where(t => !t.connection_id.ToString().Equals(Context.ConnectionId)).Select(t => t.connection_id.ToString()).ToList<string>();
                Clients.Clients(conIds).CloseDialog(dialogId);
            }
        }
        public void takeOverSharing(string owner)
        {
            Group group = groupService.GetGroupByOwner(owner);
            string old_owner_takeover = group.owner_takeover;
            string me = Context.User.Identity.GetUserName();

            group.owner_takeover = me;
            groupService.Update(group);

            this.updateConnectionIdsToSharing(me, false);
           // _viewers.Remove(old_owner_takeover);
            List<Connection> cons = connectionService.GetByEmail(old_owner_takeover);

            Clients.Clients(cons.Select(t=>t.connection_id.ToString()).ToList<string>()).stolenTakeOverBy(me);
            _viewers.Remove(old_owner_takeover);

            //if (!string.IsNullOrEmpty(old_owner_takeover))
            //{
            //    List<Connection> cons = connectionService.GetByEmail(old_owner_takeover);
            //    foreach (Connection con in cons)
            //    {
            //        if (con != null && Context.ConnectionId != con.connection_id.ToString())
            //            Clients.Clients(_viewers[Context.User.Identity.GetUserName()]).stolenTakeOverBy(me);
            //    }
            //}
        }
        public void takeOverSharing(string mess, string owner)
        {
            Group group = groupService.GetGroupByOwner(owner);
            string old_owner_takeover = group.owner_takeover;
            string me = Context.User.Identity.GetUserName();
            if (!string.IsNullOrEmpty(mess))
            {
                me = mess;
            }            

            group.owner_takeover = me;
            groupService.Update(group);

            this.updateConnectionIdsToSharing(me, false);

            Clients.Clients(_viewers[me]).stolenTakeOverBy(me);
            _viewers.Remove(owner);


       //     _viewers.Remove(owner);

            //if (!string.IsNullOrEmpty(old_owner_takeover))
            //{
            //  ///  IList<Connection> cons = connectionService.GetByEmail(old_owner_takeover);
            //    if (cons.Count > 0)
            //    {
            //        Clients.Clients(_viewers[owner]).stolenTakeOverBy(owner);
            //        _viewers.Remove(owner);
            //       // Clients.Clients(cons.Select(t => t.connection_id.ToString()).ToList<string>()).stolenTakeOverBy(me);
            //    }
            //}
        }

        public void startSharing(object obj)
        {
            string username = Context.User.Identity.GetUserName();

            this.setStatusOfGroupProcessing(true);
            this.updateConnectionIdsToSharing(username, false);

            if (_viewers.ContainsKey(username) && _viewers[username].Count() > 0)
                Clients.Clients(_viewers[username]).sharingStarted(obj);
        }

        public void endSharing()
        {
            //If user is presenter
            if (_viewers.ContainsKey(Context.User.Identity.GetUserName()) && _viewers[Context.User.Identity.GetUserName()].Count() > 0)
            {
                this.setStatusOfGroupProcessing(false);
                List<string> cons = connectionService.GetByEmail(Context.User.Identity.GetUserName()).Select(x=>x.connection_id.ToString()).ToList();
                Clients.Clients(_viewers[Context.User.Identity.GetUserName()].Where(x=>!cons.Contains(x)).ToList()).sharingEnded(Context.User.Identity.GetUserName());
            }
            else
            {
                //If is user normal;
                string mail = Context.User.Identity.GetUserName();
                string groupOwnerMail = memberService.GetEmailOfGroupOwner(mail);
                if (!string.IsNullOrEmpty(groupOwnerMail))
                {
                    List<Connection> cons = connectionService.GetByEmail(groupOwnerMail);
                    foreach (Connection con in cons)
                    {
                        if (con != null && Context.ConnectionId != con.connection_id.ToString())
                            Clients.Client(con.connection_id.ToString()).deleteViewerList(mail);
                    }
                }
            }

            Group group = groupService.GetGroupByEmail(Context.User.Identity.GetUserName());
            if (group != null)
            {
                memberService.RemoveAllMemberGroup(group.id);
                groupService.DeleteGroup(Context.User.Identity.GetUserName());
            }
            memberService.RemoveMemberGroup(Context.User.Identity.GetUserName());

            this.requestUpdateConnectionIdsToSharing(true);



        }

        public string inviteToEmail(string _representer_mail, string _invite_mail, string language)
        {
            string msg = "";
            try
            {
                Group group = groupService.GetGroupByEmail(_representer_mail);
                if (group == null)
                    group = this.groupCreating();


                string[] invite_mails = _invite_mail.Split(new string[] { ";" }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string invite_mail in invite_mails)
                {
                    if (memberService.IsMemberAreListening(invite_mail.Trim().ToString()))
                    {
                        msg += invite_mail + ": " + MultiLanguage.GetText(language, "You can't invite because user is sharing at this time!") + "<br/>";
                        continue;
                    }

                    if (_representer_mail.Trim().ToString() == invite_mail.Trim().ToString())
                    {
                        msg += invite_mail + ": " + MultiLanguage.GetText(language, "You can't invite yourself!") + "<br/>";
                        continue;
                    }
                    List<string> cons = connectionService.GetByEmail(invite_mail).Select(x=>x.connection_id.ToString()).ToList();
                    if (cons != null && cons.Count > 0)
                    {
                        if (group != null && memberService.IsMemberJoinedGroup(group.id, invite_mail))
                        {
                            msg += invite_mail + ": " + MultiLanguage.GetText(language, "User already accepted before.") + "<br/>";
                            continue;
                        }
                        Clients.Clients(cons).invitingRequest(_representer_mail, invite_mail);
                        msg += invite_mail + ": " + MultiLanguage.GetText(language, "Invitation was sent successfully.") + "<br/>";
                    }
                    else
                    {
                        msg += invite_mail + ": " + MultiLanguage.GetText(language, "User is not available at this time.") + "<br/>";
                    }
                }
            }
            catch (Exception)
            {

            }


            return msg;
        }

        public void dialogHide()
        {
            List<string> cons = connectionService.GetByEmail(Context.User.Identity.GetUserName()).Where(x => x.connection_id.ToString() != Context.ConnectionId).Select(x=>x.connection_id.ToString()).ToList();
            Clients.Clients(cons).hideDialog();
        }

        public void refreshAutoSimple()
        {
            string username = Context.User.Identity.GetUserName();
            List<string> cons = connectionService.GetByEmail(Context.User.Identity.GetUserName()).Where(x => x.connection_id.ToString() != Context.ConnectionId).Select(x => x.connection_id.ToString()).ToList();
            Clients.Clients(cons).autoRefreshSimple();
        }

        public void refreshAutoAfterStopSharing()
        {
            List<string> cons = connectionService.GetByEmail(Context.User.Identity.GetUserName()).Where(x => x.connection_id.ToString() != Context.ConnectionId).Select(x => x.connection_id.ToString()).ToList();
            Clients.Clients(cons).autoRefreshAfterStopSharing();
        }

        public void acceptInviting(string _representer_mail)
        {
            List<int> groupIdsTakeOver = memberService.ListTakeOverOfMember(Context.User.Identity.GetUserName());
            List<string> takeovers = new List<string>();
            foreach (int groupId in groupIdsTakeOver)
            {
                Group groupTakeOver = groupService.GetById(groupId);
                if (groupTakeOver != null)
                    takeovers.Add(groupTakeOver.owner_takeover);
            }

            //Left all group
            memberService.RemoveMemberGroup(Context.User.Identity.GetUserName());
            groupService.DeleteGroup(Context.User.Identity.GetUserName());

            foreach (string takeover in takeovers)
            {
                List<Connection> cons = connectionService.GetByEmail(takeover);
                foreach (Connection con in cons)
                {
                    if (con != null && Context.ConnectionId != con.connection_id.ToString())
                        Clients.Client(con.connection_id.ToString()).deleteViewerList(Context.User.Identity.GetUserName());
                }
            }

            Group group = groupService.GetGroupByEmail(_representer_mail);
            if (group != null)
            {
                memberService.MemberJoinGroup(group.id, Context.User.Identity.GetUserName());
            }

            string mail = Context.User.Identity.GetUserName();
            string groupOwnerMail = memberService.GetEmailOfGroupOwner(mail);
            if (!string.IsNullOrEmpty(groupOwnerMail))
            {
                List<Connection> cons = connectionService.GetByEmail(groupOwnerMail);
                foreach (Connection con in cons)
                {
                    if (con != null && Context.ConnectionId != con.connection_id.ToString())
                        Clients.Client(con.connection_id.ToString()).addViewerList(mail);
                }
            }
        }


        public void sendtransferData(object obj)
        {
            if (_viewers.ContainsKey(Context.User.Identity.GetUserName()) && _viewers[Context.User.Identity.GetUserName()].Count() > 0)
                Clients.Clients(_viewers[Context.User.Identity.GetUserName()].Where(x => x != Context.ConnectionId).ToList()).dataTransfered(obj);
        }


        public Group groupCreating()
        {
            string username = Context.User.Identity.GetUserName();
            if (!string.IsNullOrEmpty(username))
            {
                //Left all group
                List<int> groupIdsTakeOver = memberService.ListTakeOverOfMember(username);
                List<string> takeovers = new List<string>();
                foreach (int groupId in groupIdsTakeOver)
                {
                    Group group = groupService.GetById(groupId);
                    if (group != null)
                        takeovers.Add(group.owner_takeover);
                }

                memberService.RemoveMemberGroup(Context.User.Identity.GetUserName());
                groupService.DeleteGroup(Context.User.Identity.GetUserName());

                foreach (string mail in takeovers)
                {
                    List<Connection> cons = connectionService.GetByEmail(mail);
                    foreach (Connection con in cons)
                    {
                        if (con != null && Context.ConnectionId != con.connection_id.ToString())
                            Clients.Client(con.connection_id.ToString()).deleteViewerList(username);
                    }
                }

                Group newGroup = new Group();
                newGroup.owner = username;
                newGroup.owner_takeover = username;
                newGroup.status = true;
                newGroup.processing = false;
                newGroup.time_create = DateTime.Now;
                groupService.Create(newGroup);

                memberService.MemberJoinGroup(newGroup.id, Context.User.Identity.GetUserName());

                return newGroup;

            }
            return null;
        }

        public void setStatusOfGroupProcessing(bool status)
        {
            string username = Context.User.Identity.GetUserName();
            if (!string.IsNullOrEmpty(username))
            {
                Group group = groupService.GetGroupByEmail(username);
                if (group != null)
                {
                    group.processing = status;
                    groupService.Update(group);
                }
            }
        }
    }
}