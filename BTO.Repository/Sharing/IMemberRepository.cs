using System;
using BTO.Model;
using BTO.Repository.Common;

namespace BTO.Repository
{
    public interface IMemberRepository : IGenericRepository<Member>
    {
        Member GetById(int id);
    }
}
