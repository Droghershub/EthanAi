using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;

namespace BTO.Service
{
    public class MemberService : EntityService<Member>, IMemberService
    {
        IUnitOfWork _unitOfWork;
        IMemberRepository _memberRepository;

        public MemberService(IUnitOfWork unitOfWork, IMemberRepository memberRepository)
            : base(unitOfWork, memberRepository)
        {
            _unitOfWork = unitOfWork;
            _memberRepository = memberRepository;
        }


        public Member GetById(int Id)
        {
            return _memberRepository.GetById(Id);
        }

        public void MemberJoinGroup(int groupId, string mail)
        {
            Member member = _memberRepository.FindBy(x => x.member == mail && x.group_id == groupId).FirstOrDefault();
            if (member == null)
            {
                Member newMember = new Member();
                newMember.group_id = groupId;
                newMember.member = mail;
                newMember.accepted = true;
                this.Create(newMember);
            }
            else if (member.accepted == false)
            {
                member.accepted = true;
                this.Update(member);
            }
        }

        public List<string> GetAllMemberGroup(string _representer_mail)
        {
            List<Member> members = _memberRepository.FindBy(x => x.group.owner_takeover == _representer_mail && x.group.status == true && x.member != _representer_mail && x.accepted == true).ToList();
            return members.Select(x => x.member).ToList();
        }

        public List<string> GetAllMemberGroup(string _representer_mail, int groupId)
        {
            List<Member> members = _memberRepository.FindBy(x => x.group_id == groupId && x.accepted == true).ToList();
            return members.Select(x => x.member).ToList();
        }

        public void RemoveAllMemberGroup(int groupId)
        {
            List<Member> members = _memberRepository.FindBy(x => x.group_id == groupId && x.group.status == true).ToList();
            foreach (Member member in members)
            {
                member.accepted = false;
                this.Update(member);
            } 
        }

        public void RemoveMemberGroup(string email)
        {
            List<Member> members = _memberRepository.FindBy(x => x.member == email && x.group.status == true).ToList();
            foreach (Member member in members)
            {
                member.accepted = false;
                this.Update(member);
            }                  
        }

        public bool IsMemberAreListening(string email)
        {
            List<Member> members = _memberRepository.FindBy(x => x.member == email && x.group.status == true && x.group.processing == true).ToList();
            if (members != null && members.Count() > 0)
                return true;
            else return false;
        }

        public string GetEmailOfGroupOwner(string email)
        {
            Member member = _memberRepository.FindBy(x => x.member == email && x.group.status == true).FirstOrDefault();
            if (member != null)
                return member.group.owner_takeover;
            return null;
        }

        public bool IsMemberJoinedGroup(int groupId, string mail)
        {
            Member member = _memberRepository.FindBy(x => x.member == mail && x.group_id == groupId).FirstOrDefault();
            if (member == null)
            {
                return false;
            }
            else if (member.accepted == false)
            {
                return false;
            }
            return true;
        }


        public List<int> ListTakeOverOfMember(string email)
        {
            List<Member> members = _memberRepository.FindBy(x => x.member == email && x.accepted == true).ToList();
            List<int> groupIds = new List<int>();
            foreach (Member member in members)
            {
                groupIds.Add(member.group_id);
            }
            return groupIds;
        }

        public Member GetByEmail(string email)
        {
            return _memberRepository.FindBy(x => x.member == email && x.accepted == true).FirstOrDefault();
        }

    }
}
