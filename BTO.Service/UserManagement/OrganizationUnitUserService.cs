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
using BTO.Common;
using System.Reflection;
using System.Transactions;
using BTO.Model.UserManagement;
namespace BTO.Service
{
    public class OrganizationUnitUserService : EntityService<OrganizationUnitUser>, IOrganizationUnitUserService
    {
        IUnitOfWork _unitOfWork;
        IOrganizationUnitUserRepository _organizationUnitUserRepository;

        public OrganizationUnitUserService(IUnitOfWork unitOfWork, IOrganizationUnitUserRepository organizationUnitUserRepository)
            : base(unitOfWork, organizationUnitUserRepository)
        {
            _unitOfWork = unitOfWork;
            _organizationUnitUserRepository = organizationUnitUserRepository;
        }


        public OrganizationUnitUser GetById(int Id)
        {
            return _organizationUnitUserRepository.GetById(Id);
        }

        public List<AspNetUserDTO> GetAvailableUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch)
        {
            return _organizationUnitUserRepository.GetAvailableUsersOfOrganizationUnit(organization_unit_id, start, number, textsearch);
        }

        public List<AspNetUserDTO> GetAssignedUsersOfOrganizationUnit(int organization_unit_id, int start, int number, string textsearch)
        {
            return _organizationUnitUserRepository.GetAssignedUsersOfOrganizationUnit(organization_unit_id, start, number, textsearch);
        }

        public bool AddUserToOrganizationUnit(List<OrganizationUnitUser> organizationUnitUser)
        {
            if (organizationUnitUser.Count() > 0)
            {
                _organizationUnitUserRepository.BulkInsert("um_organization_user", organizationUnitUser);
            }
            return true;
        }

        public bool DeleteAssignedUsersOfOrganizationUnit(string organization_unit_ids)
        {
            return _organizationUnitUserRepository.DeleteAssignedUsersOfOrganizationUnit(organization_unit_ids);            
        }

        public bool UpdateOrganizationUnitUser(OrganizationUnitUser _organizationUnitUser )
        {
            OrganizationUnitUser organizationUnitUser = _organizationUnitUserRepository.FindBy(x => x.user_id == _organizationUnitUser.user_id && x.organization_unit_id == _organizationUnitUser.organization_unit_id && x.role_id == _organizationUnitUser.role_id).FirstOrDefault();
            if (organizationUnitUser == null)
            {
                //Create new record
                _organizationUnitUserRepository.Add(_organizationUnitUser);
                _organizationUnitUserRepository.SaveChange();
            }
            else
            {
                //If existing before
                _organizationUnitUserRepository.Delete(x => x.user_id == _organizationUnitUser.user_id && x.organization_unit_id == _organizationUnitUser.organization_unit_id && x.role_id == _organizationUnitUser.role_id);
                _organizationUnitUserRepository.SaveChange();
                _organizationUnitUserRepository.Add(_organizationUnitUser);
                _organizationUnitUserRepository.SaveChange();
            }
            return true;
        }


        public IList<string> GetUiVersionByUserId(string user_id)
        {
            return _organizationUnitUserRepository.GetUiVersionByUserId(user_id);
        }
    }
}
