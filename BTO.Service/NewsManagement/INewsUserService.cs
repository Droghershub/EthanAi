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
    public interface INewsUserService : IEntityService<NewsUser>
    {
        NewsUser GetById(int Id);
        NewsUser GetByNewIdAndUserId(int newsId, string user_id);
    }
}
