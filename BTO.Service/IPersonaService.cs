using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model;
using BTO.Service.Common;

namespace BTO.Service
{
    public interface IPersonaService : IEntityService<Persona>
    {
        Persona GetById(int Id);
        Persona GetByUserIdAndVariable(Guid _userId, string _variable);
        List<Persona> GetByUserId(Guid _userId);
        int UpdatePersona(List<Persona> _persona);
    }
}
