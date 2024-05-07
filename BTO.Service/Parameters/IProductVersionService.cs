using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface IProductVersionService : IEntityService<ProductVersion>
    {
        ProductVersion GetById(int Id);
        ProductVersion CloneProductVersion(ProductVersionMapping cloneVersion);
        ProductVersion GetByUserId(string user_id);
    }
}
