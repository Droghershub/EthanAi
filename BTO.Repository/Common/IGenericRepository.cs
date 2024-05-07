using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
namespace BTO.Repository.Common
{
    public interface IGenericRepository<T> where T : BaseEntity
    {

        IEnumerable<T> GetAll();
        IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
        IEnumerable<T> FindBySelector(Expression<Func<T, int, T>> selector, Expression<Func<T, bool>> predicate);
        void Delete(Expression<Func<T, bool>> predicate);
        T Add(T entity);
        void Attached(T entity);
        T Delete(T entity);
        void Edit(T entity);
        void Save();
        int SaveChange();
        void BulkInsert<T>(string tableName, IList<T> list);
    }
}
