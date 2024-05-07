using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;

namespace BTO.Repository
{
    public interface IOrganizationUnitRepository : IGenericRepository<OrganizationUnit>
    {
        OrganizationUnit GetById(int id);
        void DeleteTopParentId(int topParentId);
    }
}
