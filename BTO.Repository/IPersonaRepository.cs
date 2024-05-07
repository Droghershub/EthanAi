using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IPersonaRepository : IGenericRepository<Persona>
    {
        Persona GetById(int id);

        void UpdatePersona(System.Collections.Generic.List<Persona> personas);
    }
}
