using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using System.Data.SqlClient;
using System.Data;
using System.ComponentModel;
using System.Configuration;
namespace BTO.Repository.Common
{
    public abstract class GenericRepository<T> : IGenericRepository<T>
       where T : BaseEntity
    {
        protected DbContext _entities;
        protected readonly IDbSet<T> _dbset;

        public GenericRepository(DbContext context)
        {
            _entities = context;
            _dbset = context.Set<T>();
        }

        public virtual IEnumerable<T> GetAll()
        {

            return _dbset.AsEnumerable<T>();
        }

        public IEnumerable<T> FindBy(System.Linq.Expressions.Expression<Func<T, bool>> predicate)
        {
            IEnumerable<T> query = _dbset.Where(predicate).AsEnumerable(); 
            return query;
        }
        public IEnumerable<T> FindBySelector(System.Linq.Expressions.Expression<Func<T, int,T>> selector, System.Linq.Expressions.Expression<Func<T, bool>> predicate)
        {
            IEnumerable<T> query = _dbset.Select(selector).Where(predicate).AsEnumerable();
            return query;
        }

        public void Delete(System.Linq.Expressions.Expression<Func<T, bool>> predicate)
        {
           _dbset.Where(predicate).ToList<T>().ForEach(ft => _dbset.Remove(ft));            
        }

        public virtual T Add(T entity)
        {
            return _dbset.Add(entity);
        }
        public void Attached(T entity)
        {            
            //_entities.Entry(entity).State = EntityState.Detached;
            _dbset.Attach(entity);
        }
        public virtual T Delete(T entity)
        {
            return _dbset.Remove(entity);
        }

        public virtual void Edit(T entity)
        {                 
            _entities.Entry(entity).State = System.Data.Entity.EntityState.Modified;            
        }

        public virtual void Save()
        {
            _entities.SaveChanges();
           
        }

        public virtual int SaveChange()
        {
            int numberChanged = 0;
            using (var dbContextTransaction = _entities.Database.BeginTransaction())
            {
                numberChanged = _entities.SaveChanges();
                dbContextTransaction.Commit();
            }
            return numberChanged;
        }

        public virtual void BulkInsert<T>(string tableName, IList<T> list)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["BTOContext"].ConnectionString; 
            //"data source=ezsvl6hp0v.database.windows.net;initial catalog=BTO;user id=BTO;password=Sparta@12345;multipleactiveresultsets=True; timeout=500";
            using (var bulkCopy = new SqlBulkCopy(connectionString))
            {
                bulkCopy.BatchSize = list.Count;
                bulkCopy.DestinationTableName = tableName;

                var table = new DataTable();
                var props = TypeDescriptor.GetProperties(typeof(T))
                    //Dirty hack to make sure we only have system data types 
                    //i.e. filter out the relationships/collections
                                           .Cast<PropertyDescriptor>()
                                           .Where(propertyInfo => propertyInfo.PropertyType.Namespace.Equals("System"))
                                           .ToArray();

                foreach (var propertyInfo in props)
                {
                    bulkCopy.ColumnMappings.Add(propertyInfo.Name, propertyInfo.Name);
                    table.Columns.Add(propertyInfo.Name, Nullable.GetUnderlyingType(propertyInfo.PropertyType) ?? propertyInfo.PropertyType);
                }

                var values = new object[props.Length];
                foreach (var item in list)
                {
                    for (var i = 0; i < values.Length; i++)
                    {
                        values[i] = props[i].GetValue(item);
                    }

                    table.Rows.Add(values);
                }

                bulkCopy.WriteToServer(table);
            }
        }
    }
}
