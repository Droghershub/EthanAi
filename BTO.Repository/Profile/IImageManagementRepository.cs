using BTO.Model.Profile;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository.Profile
{
    public interface IImageManagementRepository :IGenericRepository<Image>
    {
        IList<Image> Get(Guid user_id);
        IList<Image> Get(Guid user_id, Model.Common.ImageType type, int dream_type_id);
        int DeleteImage(int id);
        int UpdateImage(Image image);
        Image AddImage(Image image);

        Image GetById(int id);
    }
}
