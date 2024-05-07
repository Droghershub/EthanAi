using BTO.Model;
using BTO.Model.Profile;
using BTO.Model.Rating;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;


namespace BTO.Repository.NewsManagement
{
    public interface INewsUserRepository : IGenericRepository<NewsUser>
    {
        NewsUser GetById(int id);
    }
}
