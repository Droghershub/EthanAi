﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
namespace BTO.Service.Common
{
    public abstract class EntityService<T> : IEntityService<T> where T : BaseEntity
    {
        IUnitOfWork _unitOfWork;
        IGenericRepository<T> _repository;
        private IUnitOfWork unitOfWork;
        private Tracking.IClientProfileService clientProfileRepository;
        private Portfolios.IPortfolioService _portfolioRepository;

        public EntityService(IUnitOfWork unitOfWork, IGenericRepository<T> repository)
        {
            _unitOfWork = unitOfWork;
            _repository = repository;
        }

        //public EntityService(IUnitOfWork unitOfWork, Tracking.IClientProfileService clientProfileRepository)
        //{
        //    // TODO: Complete member initialization
        //    this.unitOfWork = unitOfWork;
        //    this.clientProfileRepository = clientProfileRepository;
        //} 

        public virtual void Create(T entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException("entity");
            }
            _repository.Add(entity);
            _unitOfWork.Commit();         
        }


        public virtual void Update(T entity)
        {
            if (entity == null) throw new ArgumentNullException("entity");
            _repository.Edit(entity);
            _unitOfWork.Commit();
        }

        public virtual void Delete(T entity)
        {
            if (entity == null) throw new ArgumentNullException("entity");
            _repository.Delete(entity);
            _unitOfWork.Commit();
        }

        public virtual void Delete(System.Linq.Expressions.Expression<Func<T, bool>> predicate)
        {
            _repository.Delete(predicate);
            _unitOfWork.Commit();
        }

        public virtual IEnumerable<T> GetAll()
        {
            return _repository.GetAll();
        }
    }
}
