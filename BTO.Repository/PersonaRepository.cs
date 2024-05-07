using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public class PersonaRepository : GenericRepository<Persona>, IPersonaRepository
    {
        public PersonaRepository(DbContext context)
            : base(context)
        {
           
        }
        public Persona GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();            
        }
         
        public void UpdatePersona(List<Persona> personas)
        {
            var xml = new System.Data.SqlClient.SqlParameter("@xml", BTO.Common.Utils.ToXML(personas));
            this._entities.Database.ExecuteSqlCommand("SaveCashFlow @xml", xml);
        }
    }
}
