using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;
using System.Xml.Linq;

namespace BTO.Repository
{
    public class ParameterRepository : GenericRepository<Parameter>, IParameterRepository
    {
        public ParameterRepository(DbContext context)
            : base(context)
        {
           
        }
        public Parameter GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }

        public List<Parameter> GetByTopParentId(int topParentId)
        {
            var parentId = new System.Data.SqlClient.SqlParameter("@parentId", topParentId);
            return this._entities.Database.SqlQuery<Parameter>("GetParameter @parentId", parentId).ToList();
        }
        public void DeleteByListIds(List<int> ids)
        {
            //return _entities.Set<PersonaPlan>().Where(x=>ids.Contains(x.id)).ToList();
            Delete(t => ids.Contains(t.id));
            _entities.SaveChanges();
        }

        public void DeleteTopParentId(int topParentId)
        {
            var parentId = new System.Data.SqlClient.SqlParameter("@parentId", topParentId);
            this._entities.Database.ExecuteSqlCommand("DeleteParameter @parentId", parentId);
        }
         public List<Parameter> GetParametersForUser(string user_id)
        {
            var userparam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);

            return _entities.Database.SqlQuery<Parameter>("GetParametersForUser @user_id", userparam).ToList();
        }
         public List<Parameter> GetParametersForUserProfile(string user_id)
         {
             var userparam = new System.Data.SqlClient.SqlParameter("@user_id", user_id);

             return _entities.Database.SqlQuery<Parameter>("GetParametersForUserProfile @user_id", userparam).ToList();
         }

        public List<Parameter> UpdateParameterFromRule(int productVersionId, Dictionary<string, string> name_value_parametterList, Dictionary<string, string> name_parent_parametterList, Dictionary<string, string> name_issum_parametterList, Dictionary<string, string> name_isformular_parametterList)
        {
            XElement root = new XElement("parameters");
            foreach (var pair in name_value_parametterList)
            {
                XElement item = new XElement("param");
                XElement cKey = new XElement("key", pair.Key);
                XElement cValue = new XElement("value", pair.Value);
                XElement cParent = new XElement("parent", name_parent_parametterList[pair.Key]);
                XElement cSum = new XElement("issum", name_issum_parametterList[pair.Key]);
                XElement cFormula = new XElement("isformula", name_isformular_parametterList[pair.Key]);
                item.Add(cKey); item.Add(cValue); item.Add(cParent); item.Add(cSum); ; item.Add(cFormula);
                root.Add(item);
            }

            var reader = root.CreateReader();
            reader.MoveToContent();           
            string xmlParameters = reader.ReadInnerXml();
            var xml = new System.Data.SqlClient.SqlParameter("@ParametersXml", xmlParameters);
            var product_version_id = new System.Data.SqlClient.SqlParameter("@product_version_id", productVersionId);
            var result = this._entities.Database.ExecuteSqlCommand("UpdateParameterFromRule @product_version_id, @ParametersXml", product_version_id, xml);
            return null;
        }
    }
}
