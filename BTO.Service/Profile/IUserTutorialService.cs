﻿using BTO.Model.Profile;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service.Profile
{
    public interface IUserTutorialService : IEntityService<UserTutorial>
    {
        List<UserTutorial> GetUserTutorialByUserId(Guid user_id);
    }
}
