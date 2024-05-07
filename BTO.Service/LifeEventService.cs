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

namespace BTO.Service
{
    public class LifeEventService : EntityService<LifeEvent>, ILifeEventService
    {
        IUnitOfWork _unitOfWork;
        ILifeEventRepository _lifeEventRepository;

        public LifeEventService(IUnitOfWork unitOfWork, ILifeEventRepository lifeEventRepository)
            : base(unitOfWork, lifeEventRepository)
        {
            _unitOfWork = unitOfWork;
            _lifeEventRepository = lifeEventRepository;
        }


        public LifeEvent GetById(int Id)
        {
            return _lifeEventRepository.GetById(Id);
        }
        public static LifeEvent Copy(LifeEvent source, LifeEvent target)
        {
            target.value = source.value;
            target.starting_age = source.starting_age;
            target.transaction_tax = source.transaction_tax;
            target.transaction_cost = source.transaction_cost;
            target.yearly_cost_reduction = source.yearly_cost_reduction;
            target.name = source.name;
            target.dream_id = source.dream_id;
            target.existant = source.existant;
            target.age_dependent = source.age_dependent;
            target.photo_path = source.photo_path;
            target.dependent_reference = source.dependent_reference;


            target.is_absolute_lifeevent_transaction_tax = source.is_absolute_lifeevent_transaction_tax;
            target.is_absolute_lifeevent_transaction_cost = source.is_absolute_lifeevent_transaction_cost;
            target.is_absolute_lifeevent_yearly_cost = source.is_absolute_lifeevent_yearly_cost;
                        

            return target;
        }
        public override void Create(LifeEvent entity)
        {
            _lifeEventRepository.Add(entity);
            _lifeEventRepository.SaveChange();
        }
        public override void Update(LifeEvent entity)
        {
            if(entity.id> 0)
            {
                _lifeEventRepository.Attached(entity);
                _lifeEventRepository.Edit(entity);
                _lifeEventRepository.Save();
            }
        }
        public void SetDefaultData(Dream dream)
        {

        }

        public void DeleteAllByUserId(int Id)
        {
            var liveEvents = _lifeEventRepository.FindBy(t => t.persona_plan_id == Id);
            foreach (var item in liveEvents)
            {
                _lifeEventRepository.Delete(item);
            }
        }

        public void UpdateDependentReferenceOfLifeEvent(int persona_plan_id, string oldValue, string newValue)
        {
            var liveEvents = _lifeEventRepository.FindBy(t => t.persona_plan_id == persona_plan_id && t.dependent_reference == oldValue);
            foreach (var entity in liveEvents)
            {
                /*entity.dependent_reference = newValue;
                _lifeEventRepository.Attached(entity);
                _lifeEventRepository.Edit(entity);
                _lifeEventRepository.Save();*/
                _lifeEventRepository.Delete(entity);
            }
        }
    }
}
