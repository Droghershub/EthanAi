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
    public class NewsUserRepository : GenericRepository<NewsUser>, INewsUserRepository
    {
        public NewsUserRepository(DbContext context)
            : base(context)
        {

        }
        public NewsUser GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();
        }
    }
}
