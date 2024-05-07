using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;
using BTO.Common;

namespace BTO.Service
{
    public class ListItemService : EntityService<ListItem>, IListItemService
    {
        IUnitOfWork _unitOfWork;
        IListItemRepository _listItemRepository;

        public ListItemService(IUnitOfWork unitOfWork, IListItemRepository listItemRepository)
            : base(unitOfWork, listItemRepository)
        {
            _unitOfWork = unitOfWork;
            _listItemRepository = listItemRepository;
        }


        public ListItem GetById(int Id)
        {
            return _listItemRepository.GetById(Id);
        }

        public List<ListItem> GetByParameterOfDefault()
        {            
            return _listItemRepository.FindBy(x => x.parameter.productVersion.is_default == true && x.parameter.type == CommonTypes.PARAMETER_LIST).ToList();
        }

        public List<ListItem> GetByParameterId(int parameterId)
        {
            return _listItemRepository.FindBy(x => x.parameter_id == parameterId).ToList();
        }
        public void DeleteAll(List<ListItem> ListItems)
        {
            int[] arr = new int[ListItems.Count];
            int i = 0;
            foreach (ListItem sc in ListItems)
            {
                //string name = sc.name + " – copy";
                //CreatePersonaPlanFromAnother(sc.id, name);
                arr[i] = sc.id;
                i++;
            }
            _listItemRepository.DeleteByListIds(arr);
        }
        public List<ListItemModel> GetListItemsForUser(string user_id)
        {
            return _listItemRepository.GetListItemsForUser(user_id);
        }
    }
}
