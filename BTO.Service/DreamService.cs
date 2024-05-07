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
    public class DreamService : EntityService<Dream>, IDreamService
    {
        IUnitOfWork _unitOfWork;
        IDreamRepository _dreamRepository;

        public DreamService(IUnitOfWork unitOfWork, IDreamRepository dreamRepository)
            : base(unitOfWork, dreamRepository)
        {
            _unitOfWork = unitOfWork;
            _dreamRepository = dreamRepository;
        }


        public Dream GetById(int Id)
        {
            return _dreamRepository.GetById(Id);
        }
        public static Dream Copy(Dream source, Dream target)
        {
            target.purchase_age = source.purchase_age;
            target.total_cost = source.total_cost;
            target.transaction_cost = source.transaction_cost;
            target.down_payment = source.down_payment;
            target.payment_duration = source.payment_duration;
            target.mortage_interest_rate = source.mortage_interest_rate;
            target.rental_net_income = source.rental_net_income;
            target.yearly_expenses = source.yearly_expenses;
            target.name = source.name;
            target.existant = source.existant;
            target.photo_path = source.photo_path;
            target.dependent_reference = source.dependent_reference;
            target.is_rent = source.is_rent;
            target.is_living = source.is_living;
            target.residential_type = source.residential_type;

            target.is_absolute_dream_down_payment = source.is_absolute_dream_down_payment;
            target.is_absolute_dream_transaction_cost = source.is_absolute_dream_transaction_cost;
            target.is_absolute_dream_yearly_expenses = source.is_absolute_dream_yearly_expenses;
            target.is_absolute_dream_rental_net_income = source.is_absolute_dream_rental_net_income;

    
            return target;
        }
        public override void Create(Dream entity)
        {
            _dreamRepository.Attached(entity);
            _dreamRepository.Save();
            //base.Create(entity);
        }

        public void CreateNew(Dream entity)
        {
            _dreamRepository.Attached(entity);
            _dreamRepository.Add(entity);
            _dreamRepository.Save();
        }

        public override void Update(Dream entity)
        {
            if(entity.id> 0)
            {
                _dreamRepository.Attached(entity);
                _dreamRepository.Edit(entity);
                _dreamRepository.Save();
            }
        }
        public void SetDefaultData(Dream dream)
        {

        }
        public void DeleteAllByUserId(int Id)
        {
            var deams = _dreamRepository.FindBy(t => t.persona_plan_id == Id);
            foreach (var item in deams)
            {
                _dreamRepository.Delete(item);
            }
        }

        public void UpdateDependentReferenceOfDream(int persona_plan_id, string oldValue, string newValue)
        {
            var deams = _dreamRepository.FindBy(t => t.persona_plan_id == persona_plan_id && t.dependent_reference == oldValue);
            foreach (var entity in deams)
            { 
                entity.dependent_reference = newValue;
                _dreamRepository.Attached(entity);
                _dreamRepository.Edit(entity);
                _dreamRepository.Save();
            }
        }


    }
}
