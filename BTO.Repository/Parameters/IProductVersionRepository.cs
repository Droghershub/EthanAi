using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IProductVersionRepository : IGenericRepository<ProductVersion>
    {
        ProductVersion GetById(int id);
        ProductVersion CloneProductVersion(ProductVersionMapping cloneVersion);
        ProductVersion GetByUserId(string user_id);
    }
}
