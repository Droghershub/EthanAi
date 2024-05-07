using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
namespace BTO.Service.Common
{
    public interface IEntityService<T> : IService
     where T : BaseEntity
    {
        void Create(T entity);
        void Delete(T entity);
        void Delete(System.Linq.Expressions.Expression<Func<T, bool>> predicate);
        IEnumerable<T> GetAll();      
        void Update(T entity);
    }
}
