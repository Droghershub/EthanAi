using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface IMemberService : IEntityService<Member>
    {
        Member GetById(int Id);
        void MemberJoinGroup(int groupId, string mail);
        void RemoveAllMemberGroup(int groupId);
        void RemoveMemberGroup(string email);
        bool IsMemberJoinedGroup(int groupId, string mail);
        List<string> GetAllMemberGroup(string _representer_mail);
        List<string> GetAllMemberGroup(string _representer_mail, int groupId);
        string GetEmailOfGroupOwner(string email);
        bool IsMemberAreListening(string email);
        List<int> ListTakeOverOfMember(string email);
        Member GetByEmail(string email);
    }
}
