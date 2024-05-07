using BTO.Model;
using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service
{
    public interface INewsService : IEntityService<News>
    {
        News GetById(int Id);
        List<News> GetNewsByUserId(string user_id);
    }
}
