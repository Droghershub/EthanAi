using BTO.Model.UserManagement;
using BTO.Repository.Common;
using BTO.Repository.UserManagement;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.UserManagement
{
    public class RoleService : EntityService<Role>, IRoleService
    {
        IUnitOfWork _unitOfWork;
        IRoleRepository _roleRepository;

        public RoleService(IUnitOfWork unitOfWork, IRoleRepository _roleRepository)
            : base(unitOfWork, _roleRepository)
        {
            _unitOfWork = unitOfWork;
            this._roleRepository = _roleRepository;
        }

        public List<Role> GetAll()
        {
            return this._roleRepository.GetAllRole();
        }

        public int Delete(int id)
        {
            return this._roleRepository.Delete(id);
        }

        public int Update(Role role)
        {
            return this._roleRepository.Update(role);
        }

        public Role GetById(int id)
        {
            return this._roleRepository.GetById(id);
        }


        public Role AddRole(Role role)
        {
           return this._roleRepository.AddRole(role); 
        }

        public object GetRolesOfUsersInOrganizationUnit(string user_id, int organization_unit_id)
        {
            List<RoleDTO> roles = _roleRepository.GetRolesOfUsersInOrganizationUnit(user_id, organization_unit_id);

            return new
            {
                default_roles = roles.Where(x => x.role_type == 0).ToList(),
                allowable_roles = roles.Where(x => x.role_type == 2).ToList()
            };            
            
        }
    }
}
