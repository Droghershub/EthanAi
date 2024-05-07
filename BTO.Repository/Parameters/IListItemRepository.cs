using System;
using BTO.Model;
using BTO.Repository.Common;
using System.Collections.Generic;

namespace BTO.Repository
{
    public interface IListItemRepository : IGenericRepository<ListItem>
    {
        ListItem GetById(int id);
        void DeleteByListIds(int[] ids);
        List<ListItemModel> GetListItemsForUser(string user_id);
    }
}
