using BTO.Model;
using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.NewsManagement
{
    public class NewsOrganizationUnitRepository : GenericRepository<NewsOrganizationUnit>, INewsOrganizationUnitRepository
    {
        public NewsOrganizationUnitRepository(DbContext context)
            : base(context)
        {

        }
        public NewsOrganizationUnit GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();
        }
    }
}
