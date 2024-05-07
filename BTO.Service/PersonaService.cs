using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
using BTO.Model.Common;
using BTO.Repository;
using BTO.Repository.Common;
using BTO.Service.Common;

namespace BTO.Service
{
    public class PersonaService : EntityService<Persona>, IPersonaService
    {
        IUnitOfWork _unitOfWork;
        IPersonaRepository _personaRepository;

        public PersonaService(IUnitOfWork unitOfWork, IPersonaRepository personaRepository)
            : base(unitOfWork, personaRepository)
        {
            _unitOfWork = unitOfWork;
            _personaRepository = personaRepository;
        }


        public Persona GetById(int Id)
        {
            return _personaRepository.GetById(Id);
        }
        public Persona GetByUserIdAndVariable(Guid _userId, string _variable)
        {
            return _personaRepository.FindBy(x => x.user_id == _userId && x.variable == _variable).FirstOrDefault();
        }

        public List<Persona> GetByUserId(Guid _userId)
        {
            return _personaRepository.FindBy(x => x.user_id == _userId).ToList();
        }
        public int UpdatePersona(List<Persona> personas)
        {   
            _personaRepository.UpdatePersona(personas);
            return 0;
        }
    }
}
