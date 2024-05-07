using BTO.Model.Profile;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Profile
{
    public class UserTutorialRepository : GenericRepository<UserTutorial>, IUserTutorialRepository
    {
        public UserTutorialRepository(DbContext context)
            : base(context)
        {

        }
    }
}
