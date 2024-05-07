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
    public interface IListItemService : IEntityService<ListItem>
    {
        ListItem GetById(int Id);
        List<ListItem> GetByParameterOfDefault();
        List<ListItem> GetByParameterId(int parameterId);
        void DeleteAll(List<ListItem> ListItems);
        List<ListItemModel> GetListItemsForUser(string user_id);
    }
}
