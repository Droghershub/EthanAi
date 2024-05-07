using BTO.Model;
using BTO.Model.UserManagement;
using BTO.Service;
using BTO.Service.UserManagement;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BTO.Modules;
using System.Web;
using System.IO;
namespace BTO.API
{
    [RoutePrefix("api/usermanagement")]
    public class UserManagementController : BTOAPIController
    {
        public IOrganizationUnitService organizationUnitService { get; set; }
        public IOrganizationUnitRoleService organizationUnitRoleService { get; set; }
        public IOrganizationUnitUserService organizationUnitUserService { get; set; }
        public IRoleService roleService { get; set; }
        public IFunctionAccessRoleService functionAccessRoleService { get; set; }
        public IFunctionAccessService functionAccessService { get; set; }
        // GET api/<controller>
        [Route("GetAll")]
        public IEnumerable<OrganizationUnit> Get()
        {
            return organizationUnitService.GetAll();
        }

        [Route("CreateOrganizationUnit")]
        [HttpPost]
        public object CreateOrganizationUnit(OrganizationUnit data)
        {
            try
            {                
                organizationUnitService.Create(data);
                return data;
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        [Route("UpdateOrganizationUnit")]
        [HttpPost]
        public object UpdateOrganizationUnit(OrganizationUnit data)
        {
            try
            {
                organizationUnitService.Update(data);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }

        }

        [Route("DeleteOrganizationUnit")]
        [HttpPost]
        public IEnumerable<OrganizationUnit> DeleteOrganizationUnit(object id)
        {
            try
            {
                int organization_unit_id = Convert.ToInt32(id);
                organizationUnitService.DeleteTopParentId(organization_unit_id);
                return organizationUnitService.GetAll();
            }
            catch (Exception ex)
            {
                return null;
            }

        }


        [Route("GetAvailableUsersOfOrganizationUnit")]
        [HttpPost]
        public object GetAvailableUsersOfOrganizationUnit(Object pagingObject)
        {
            try
            {
                JObject jsonObj = (JObject)pagingObject;
                var organization_unit_id = (int)jsonObj.GetValue("organization_unit_id");
                var startIndex = 0;
                if (jsonObj.GetValue("start") != null) startIndex = (int)jsonObj.GetValue("start");
                var pageNumber = 10;
                if (jsonObj.GetValue("number") != null) pageNumber = (int)jsonObj.GetValue("number");
                var email = "";
                if (jsonObj.GetValue("email") != null) email = (string)jsonObj.GetValue("email");
                
                int numberOfPages =0;
                List<AspNetUserDTO> dataReturn = organizationUnitUserService.GetAvailableUsersOfOrganizationUnit(organization_unit_id, startIndex, pageNumber, email).ToList();
                if (dataReturn.Count()>0)
                    numberOfPages = (int)((dataReturn[0].RowTotal - 1) / pageNumber) + 1;
                return new
                {
                    numberOfPages = numberOfPages,
                    data = dataReturn
                };
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        [Route("GetAssignedUsersOfOrganizationUnit")]
        [HttpPost]
        public object GetAssignedUsersOfOrganizationUnit(Object pagingObject)
        {
            try
            {
                JObject jsonObj = (JObject)pagingObject;
                var organization_unit_id = (int)jsonObj.GetValue("organization_unit_id");
                var startIndex = 0;
                if (jsonObj.GetValue("start") != null) startIndex = (int)jsonObj.GetValue("start");
                var pageNumber = 10;
                if (jsonObj.GetValue("number") != null) pageNumber = (int)jsonObj.GetValue("number");
                var email = "";
                if (jsonObj.GetValue("email") != null) email = (string)jsonObj.GetValue("email");

                int numberOfPages = 0;
                List<AspNetUserDTO> dataReturn = organizationUnitUserService.GetAssignedUsersOfOrganizationUnit(organization_unit_id, startIndex, pageNumber, email).ToList();
                if (dataReturn.Count() > 0)
                    numberOfPages = (int)((dataReturn[0].RowTotal - 1) / pageNumber) + 1;
                return new
                {
                    numberOfPages = numberOfPages,
                    data = dataReturn
                };
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        [Route("AddUsersOfOrganizationUnit")]
        [HttpPost]
        public object AddUsersOfOrganizationUnit(List<OrganizationUnitUser> organizationUnitUsers)
        {
            return organizationUnitUserService.AddUserToOrganizationUnit(organizationUnitUsers);
        }

        [Route("RemoveUsersOfOrganizationUnit")]
        [HttpPost]
        public object RemoveUsersOfOrganizationUnit(List<int> organization_unit_ids)
        {
            return organizationUnitUserService.DeleteAssignedUsersOfOrganizationUnit(string.Join(",", organization_unit_ids.ToArray()));
        }


        [Route("GetRolesOfUsersInOrganizationUnit")]
        [HttpPost]
        public object GetRolesOfUsersInOrganizationUnit(Object pagingObject)
        {
            try
            {
                JObject jsonObj = (JObject)pagingObject;
                var user_id = (string)jsonObj.GetValue("user_id");
                var organization_unit_id = (int)jsonObj.GetValue("organization_unit_id");

                return roleService.GetRolesOfUsersInOrganizationUnit(user_id, organization_unit_id);
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        [Route("UpdateRolesOfUsersInOrganizationUnit")]
        [HttpPost]
        public bool UpdateRolesOfUsersInOrganizationUnit(OrganizationUnitUser organizationUnitUser)
        {
            try
            {
                return organizationUnitUserService.UpdateOrganizationUnitUser(organizationUnitUser);
            }
            catch (Exception ex)
            {
                return false;
            }
        }


        [Route("role")]
        [HttpGet]
        public object GetAllRole()
        {
            return roleService.GetAll();
        }
        [Route("role/add")]
        [HttpPost]
        public object AddRole(Role role)
        {
            return roleService.AddRole(role);
        }

        [Route("role/{id}")]
        [HttpGet]
        public object GetRoleById(int id)
        {
            return roleService.GetById(id);
        }

        [Route("role/{id}")]
        [HttpPost]
        public object DeleteRoleById(int id)
        {
            return roleService.Delete(id);
        }

        [Route("role")]
        [HttpPost]
        public object UpdateRole(Role role)
        {
            return roleService.Update(role);
        }

        [Route("rolebyorganizationunit")]
        [HttpPost]
        public object GetRoleByOrganizationUnitId(object id)
        {
            int organization_unit_id = Convert.ToInt32(id);
           
            
            RolePermission obj = organizationUnitRoleService.GetByOrganizationUnitId(organization_unit_id);
            obj.themes = this.getListTheme();
            return obj;
        }
        [Route("list_theme")]
        [HttpGet]
        public object GetListThemeAvaliable()
        {
            return this.getListTheme();
        }
        private IList<string> getListTheme()
        {
            string path = System.Web.Hosting.HostingEnvironment.MapPath("~/Themes/");
            IList<string> themes = new List<string>();
            foreach (string s in Directory.GetDirectories(path))
            {
                themes.Add(s.Remove(0, path.Length));
            }
            return themes;
        }
        [Route("updaterolebyorganizationunit")]
        [HttpPost]
        public object UpdateRoleByOrganizationUnitId(List<OrganizationUnitRole> roles)
        {
            return organizationUnitRoleService.UpdateOrganizationUnitRole(roles);
        }
        //for function access
        [Route("get_all_functions")]
        [HttpGet]
        public object GetAllFunctionAccess()
        {
            return functionAccessService.GetAll();
        }
        [Route("get_all_functions_by_role/{id}")]
        [HttpGet]
        public object GetAllFunctionAccess(int id)
        {
            return functionAccessRoleService.GetByRoleId(id);
        }
        [Route("update_function_for_role")]
        [HttpPost]
        public object UpdateFunctionAccessRole(FunctionAccessRoleModel model)
        {
            return functionAccessRoleService.UpdateFunctionAccessRole(model);
        }
        [Route("get_all_functions_for_user/{user_id}")]
        [HttpGet]
        public object GetAllFunctionAccess(string user_id)
        {
            var obj = functionAccessService.GetFunctionUserAccess(user_id);
            HttpContext.Current.Session.Add("UserPermission",obj);
            return obj;
        }
    }
}