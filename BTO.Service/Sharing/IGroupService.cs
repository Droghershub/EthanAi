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
    public interface IGroupService : IEntityService<Group>
    {
        Group GetById(int Id);
        Group GetGroupByEmail(string Email);
        Group GetGroupByOwner(string Email);
        Group GetGroupAreProcessingByEmail(string Email);
        void DeleteGroup(string email);
    }
}
