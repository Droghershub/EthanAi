using BTO.Model;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BTO.Repository
{
    public interface ISolutionRepository : IGenericRepository<Solution>
    {
        Boolean DeleteList(int[] listInput);

        int SaveChange(); 
        Solution GetByIdWithData(int id);
        Solution GetById(int id); 
        List<Solution> GetAllByUserId(Guid userId); 
        int GetCurrentVersionByUserId(Guid guid);
        Solution SaveSolution(Solution item);
        
    }
}
