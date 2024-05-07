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
    public class GroupService : EntityService<Group>, IGroupService
    {
        IUnitOfWork _unitOfWork;
        IGroupRepository _groupRepository;

        public GroupService(IUnitOfWork unitOfWork, IGroupRepository groupRepository)
            : base(unitOfWork, groupRepository)
        {
            _unitOfWork = unitOfWork;
            _groupRepository = groupRepository;
        }


        public Group GetById(int Id)
        {
            return _groupRepository.GetById(Id);
        }

        public Group GetGroupByEmail(string Email)
        {
            return _groupRepository.FindBy(x => x.owner_takeover == Email && x.status == true).FirstOrDefault();
        }

        public Group GetGroupByOwner(string Email)
        {
            return _groupRepository.FindBy(x => x.owner == Email && x.status == true).FirstOrDefault();
        }

        public Group GetGroupAreProcessingByEmail(string Email)
        {
            return _groupRepository.FindBy(x => x.owner_takeover == Email && x.status == true && x.processing == true).FirstOrDefault();
        }

        public void DeleteGroup(string email)
        {
            List<Group> groups = _groupRepository.FindBy(x => x.owner_takeover == email && x.status == true).ToList();
            foreach (Group group in groups)
            {
                group.status = false;
                group.processing = false;
                this.Update(group);
            }
        }      
    }
}
