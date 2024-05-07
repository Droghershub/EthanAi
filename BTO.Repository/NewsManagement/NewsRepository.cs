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
    public class NewsRepository : GenericRepository<News>, INewsRepository
    {
        public NewsRepository(DbContext context)
            : base(context)
        {

        }
        public News GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();
        }

        public List<News> GetNewsByUserId(string user_id)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);

            return _entities.Database.SqlQuery<News>("GetNewsByUserId @user_id", userparam).ToList();
        }
    }
}
