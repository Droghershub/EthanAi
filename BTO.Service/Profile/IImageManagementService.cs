using BTO.Model.Profile;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
namespace BTO.Service.Profile
{
    public interface IImageManagementService : IEntityService<Image>
    {
        int Delete(int id);
        IList<Image> Get(Guid user_id);
        IList<Image> Get(Guid user_id,Model.Common.ImageType type, int dream_type_id);
        int Update(Image image);
        Image Add(Image image);
        Image GetById(int id);
    }
}
