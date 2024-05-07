using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public class ListItemRepository : GenericRepository<ListItem>, IListItemRepository
    {
        public ListItemRepository(DbContext context)
            : base(context)
        {
           
        }
        public ListItem GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
        public void DeleteByListIds(int[] ids)
        {
            Delete(t => ids.Contains(t.id));
            _entities.SaveChanges();
        }
        public List<ListItemModel> GetListItemsForUser(string user_id)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);

            return _entities.Database.SqlQuery<ListItemModel>("GetListItemsForUser @user_id", userparam).ToList();
        }
    }
}
