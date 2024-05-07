using BTO.Model;
using BTO.Service.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Service
{
    public interface ISolutionService : IEntityService<Solution>
    {
        List<Solution> GetAll();
        Solution GetById(int id);
        List<Solution> GetByUserId(Guid userId);
        int Save(Solution solution);
        Solution Load(int id);
        int Duplicate(Solution solution);
        int Delete(int id);
        Solution ReName(Solution newName);
        Boolean DeleteByList(int[] listInput); 
        Solution SaveSolution(Solution item);
        
        int GetCurrentSolutionVersionByUserId(Guid guid);
    }
}
