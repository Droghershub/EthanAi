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
    public class ImageMangementRepository : GenericRepository<Image>, IImageManagementRepository
    {
        public ImageMangementRepository(DbContext context)
            : base(context)
        {

        } 
        public IList<Image> Get(Guid user_id)
        {
            return _dbset.Where(t => t.user_id.Equals(user_id)).OrderByDescending(t => t.id ).ToList();
        }
        public IList<Image> Get(Guid user_id, Model.Common.ImageType type, int dream_type_id)
        {
            if (type == Model.Common.ImageType.CLIENT_AVATAR || type == Model.Common.ImageType.SPOUSE_AVATAR || type == Model.Common.ImageType.CHILDREN_AVATAR)
            {
                return _dbset.Where(t => t.user_id.Equals(user_id) && t.type == type).OrderByDescending(t => t.id).ToList(); 
            }
            return _dbset.Where(t => t.user_id.Equals(user_id) && t.type == type && t.dream_type_id == dream_type_id).OrderByDescending(t => t.id).ToList(); 
        }
        public int DeleteImage(int id)
        {
             Delete(x => x.id == id); 
            return this.SaveChange();
        }

        public int UpdateImage(Image image)
        {
            this.Edit(image);
            return this.SaveChange();
        }
        public Image AddImage(Image entity)
        {
            this.Add(entity);
            this.Save();
            return entity; 
        } 
        public Image GetById(int id)
        {
            return FindBy(t => t.id == id).FirstOrDefault<Image>();
        }
    }
}
