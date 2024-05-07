using BTO.Model;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service
{
    public class SolutionService : EntityService<Solution>, ISolutionService
    {
        IUnitOfWork _unitOfWork;
        ISolutionRepository _solutionRepository;

        public SolutionService(IUnitOfWork unitOfWork, ISolutionRepository solutionRepository)
            : base(unitOfWork, solutionRepository)
        {
            _unitOfWork = unitOfWork;
            _solutionRepository = solutionRepository;
        }

        public new List<Solution> GetAll()
        {
            throw new NotImplementedException();
        }

        public Solution GetById(int id)
        {
            return _solutionRepository.GetById(id);
        }
        public Solution GetByIdWithData(int id)
        {
            return _solutionRepository.GetByIdWithData(id);
        }
        public List<Solution> GetByUserId(Guid userId)
        {
            var list = _solutionRepository.GetAllByUserId(userId);
            //if (list.Count == 0)
            //{
            //    _solutionRepository.Add(new Solution()
            //    {
            //        name = "Automatic Backup 1",
            //        number = 1,
            //        time_create = DateTime.Now,
            //        type = "Automatic",
            //        user_id = userId,
            //        version = 1
            //    });
            //    _solutionRepository.SaveChange();
            //    list = _solutionRepository.FindBy(t => t.user_id.Equals(userId)).OrderByDescending(t => t.time_create).ThenByDescending(t => t.version).ToList<Solution>();
            //}
            return list;
        }

        public int Save(Solution solution)
        {
            throw new NotImplementedException();
        }

        public Solution Load(int id)
        {
            throw new NotImplementedException();
        }

        public int Duplicate(Solution solution)
        {
            throw new NotImplementedException();
        }

        public int Delete(int id)
        {
            throw new NotImplementedException();
        }

        public Solution ReName(Solution newName)
        {
            throw new NotImplementedException();
        }
        public bool DeleteByList(int[] listInput)
        {
            return _solutionRepository.DeleteList(listInput);
        }
        public Solution SaveSolution(Solution item)
        {
            return _solutionRepository.SaveSolution(item);            
        }
        

        public int GetCurrentSolutionVersionByUserId(Guid guid)
        {
            return _solutionRepository.GetCurrentVersionByUserId(guid);
        }
    }
}
