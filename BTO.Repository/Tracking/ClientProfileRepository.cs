using BTO.Model.Tracking;
using BTO.Models;
using BTO.Repository.Common;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BTO.Model;
namespace BTO.Repository.Tracking
{
    public class ClientProfileRepository : GenericRepository<ClientProfile>, IClientProfileRepository
    {
        public ClientProfileRepository(DbContext context)
            : base(context)
        {

        }
        public override IEnumerable<ClientProfile> GetAll()
        {
            return _dbset.Select(t => new
            {
                t.id,
                t.email,
                t.time_create,               
                t.time_update
            }).AsEnumerable().Select(x => new ClientProfile() { 
                id = x.id,
                email = x.email,
                time_create = x.time_create,
                time_update = x.time_update
            }).OrderByDescending(z => z.time_create);           
        }

        public IEnumerable<ClientProfile> getSessions(string user_id, int start, int number, string email) {

            var para_user_id = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            var para_start = new System.Data.SqlClient.SqlParameter("@start", start);
            var para_number = new System.Data.SqlClient.SqlParameter("@number", number);
            var para_textsearch = new System.Data.SqlClient.SqlParameter("@textsearch", email);
            return this._entities.Database.SqlQuery<ClientProfile>("GetSession @user_id, @start, @number,@textsearch", para_user_id, para_start, para_number, para_textsearch).ToList();

            //return _dbset.Where(item => email == "" || item.email.ToLower().Contains(email.ToLower())).Select(t => new
            //{
            //    t.id,
            //    t.email,
            //    t.time_create,
            //    t.time_update
            //}).OrderByDescending(z => z.time_create).Skip(start).Take(number).AsEnumerable().Select(x => new ClientProfile()
            //{
            //    id = x.id,
            //    email = x.email,
            //    time_create = x.time_create,
            //    time_update = x.time_update
            //});   
        }

        public int getCountSessions(string user_id, int start, int number, string email) {

            var para_user_id = new System.Data.SqlClient.SqlParameter("@user_id", user_id);
            var para_start = new System.Data.SqlClient.SqlParameter("@start", start);
            var para_number = new System.Data.SqlClient.SqlParameter("@number", number);
            var para_textsearch = new System.Data.SqlClient.SqlParameter("@textsearch", email);
            return this._entities.Database.SqlQuery<int>("GetSessionCount @user_id, @start, @number,@textsearch", para_user_id, para_start, para_number, para_textsearch).FirstOrDefault();            
        }

        public ClientProfile AddClientProfile(ClientProfile profile)
        {
            var emailparam = new System.Data.SqlClient.SqlParameter("@email", profile.email);
            var dataparam = new System.Data.SqlClient.SqlParameter("@serialized_data", profile.serialized_data);
            var timeparam = new System.Data.SqlClient.SqlParameter("@time_create", profile.time_create);
            var levelparam = new System.Data.SqlClient.SqlParameter("@level_track_id", profile.level_track_id);
            var ui_versionparam = new System.Data.SqlClient.SqlParameter("@ui_version", profile.ui_version);
            return _entities.Database.SqlQuery<ClientProfile>("AddUserProfileSession @email, @serialized_data, @time_create, @level_track_id, @ui_version", emailparam, dataparam, timeparam, levelparam, ui_versionparam).FirstOrDefault();
            //return result.FirstOrDefault();
        }

        public ClientProfile GetById(int id)
        {
            return FindBy(x => x.id == id).FirstOrDefault();
        }

        public IEnumerable<ClientProfileModel> GetTrackingClientProfiles(DateTime startdate, DateTime enddate)
        {
            var para_startdate = new System.Data.SqlClient.SqlParameter("@startdate", startdate);
            var para_enddate = new System.Data.SqlClient.SqlParameter("@enddate", enddate);            
            return this._entities.Database.SqlQuery<ClientProfileModel>("GetTrackingClientProfiles @startdate, @enddate", para_startdate, para_enddate).ToList();
        }
        public IEnumerable<ClientProfileModel> GetTrackingClientProfilesByThread(DateTime startdate, DateTime enddate, int step, int paging)
        {
            var para_startdate = new System.Data.SqlClient.SqlParameter("@startdate", startdate);
            var para_enddate = new System.Data.SqlClient.SqlParameter("@enddate", enddate);
            var para_step = new System.Data.SqlClient.SqlParameter("@step", step);
            var para_paging = new System.Data.SqlClient.SqlParameter("@index", paging);
            using (BTOContext ctx = new BTOContext())
            {
                return ctx.Database.SqlQuery<ClientProfileModel>("GetTrackingClientProfiles @startdate, @enddate, @step, @index", para_startdate, para_enddate,para_step,para_paging).ToList();
            }
        }
    }
}
