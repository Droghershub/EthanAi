using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using BTO.Model.Common;
using BTO.Model.Tracking;
using BTO.Model.Profile;
using BTO.Model.UserManagement;
using BTO.Model.Rating;
namespace BTO.Model
{
    public class BTOContext : DbContext
    {

        public BTOContext()
            : base("Name=BTOContext")
        {

        }
        public DbSet<Image> Image { get; set; }
        public DbSet<PersonaPlan> PersonaPlan { get; set; }
        public DbSet<DreamType> DreamType { get; set; }
        public DbSet<Dream> Dream { get; set; }
        public DbSet<LifeEvent> LifeEvent { get; set; }
        public DbSet<DreamTypeConfig> DreamTypeConfig { get; set; }

        public DbSet<PersonalPlanTracking> ClientProfile { get; set; }
        public DbSet<ClientProfile> PersonalPlanTracking { get; set; }
        public DbSet<LogException> LogException { get; set; }

        public DbSet<UserProfile> UserProfile { get; set; }

        public DbSet<AspNetUser> AspNetUser { get; set; }
        public DbSet<UserClaims> UserClaims { get; set; }
        public DbSet<UserProfileDependent> UserProjectDependent { get; set; }
        public DbSet<Solution> Solution { get; set; }
        public DbSet<SessionModel> SessionModel { get; set; }
        public DbSet<Tutorial> Tutorial { get; set; }

        public DbSet<UserTutorial> UserTutorial { get; set; }
        public DbSet<UserSession> UserSession { get; set; }
        public DbSet<Connection> Connection { get; set; }
        public DbSet<Group> Group { get; set; }

        public DbSet<Member> Member { get; set; }
        public DbSet<ListItem> ListItem { get; set; }
        public DbSet<Parameter> Parameter { get; set; }

        public DbSet<ProductVersion> ProductVersion { get; set; }
        public DbSet<OrganizationUnit> OrganizationUnit { get; set; }

        public DbSet<OrganizationUnitRole> OrganizationUnitRole { get; set; }

        public DbSet<Role> Role { get; set; }
        public DbSet<FunctionAccess> FunctionAccess { get; set; }
        public DbSet<FunctionAccessRole> FunctionAccessRole { get; set; }
        public DbSet<OrganizationUnitUser> OrganizationUnitUser { get; set; }
        public DbSet<Persona> Persona { get; set; }
        public DbSet<UserRating> UserRating { get; set; }
        public DbSet<UserFeedback> UserFeedback { get; set; }
        public DbSet<Invitation> Invitation { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<NewsOrganizationUnit> NewsOrganizationUnit { get; set; }
        public DbSet<NewsUser> NewsUser { get; set; }

        public DbSet<IssuingAuthorityKey> IssuingAuthorityKeys { get; set; }

        public DbSet<Payment> Payment { get; set; }

        public DbSet<Tenant> Tenants { get; set; }

        public DbSet<Portfolio.Portfolio> Portfolios { get; set; }
        public DbSet<Portfolio.PortfolioSheet> Portfolio_sheets { get; set; }

        protected override void OnModelCreating(System.Data.Entity.DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PersonaPlan>().Property(x => x.salary_evolution).HasPrecision(18, 4);
            modelBuilder.Entity<PersonaPlan>().Property(x => x.inflation).HasPrecision(18, 4);
            modelBuilder.Entity<PersonaPlan>().Property(x => x.risk_return).HasPrecision(18, 4);
            modelBuilder.Entity<PersonaPlan>().Property(x => x.volatility).HasPrecision(18, 4);
            modelBuilder.Entity<UserSession>().MapToStoredProcedures(
                s => s.Insert(i => i.HasName("[dbo].[UserSession_Insert]")
                    .Parameter(t => t.client_profile_id, "client_profile_id")
                    .Parameter(t => t.action_name, "action_name")
                    .Parameter(t => t.action_description, "action_description")
                    .Parameter(t => t.data, "data")
                    .Parameter<DateTime>(t => t.time_create, "time_create")
                    )
            );
            modelBuilder.Entity<Solution>().MapToStoredProcedures(
                p => p.Insert(a => a.HasName("[dbo].[Solution_Insert]")
                        .Parameter(b => b.name, "name")
                        .Parameter(b => b.user_id, "user_id")
                        .Parameter(b => b.type, "type")
                        .Parameter(b => b.serialized_data, "data")
                        .Parameter(b => b.time_create, "time_create")
                        .Parameter(b => b.version, "version")
                    )
                    .Delete(c => c.HasName("[dbo].[Solution_Delete]")
                        .Parameter(d=>d.id,"id")
                    )
                    .Update(e => e.HasName("[dbo].[Solution_Update]")
                        .Parameter(f=>f.id,"id")
                        .Parameter(f=>f.name,"name")                                
                    )
            );
            modelBuilder.Properties<decimal>().Configure(config => config.HasPrecision(18, 4));
            base.OnModelCreating(modelBuilder);
        }

        public override int SaveChanges()
        {
            var modifiedEntries = ChangeTracker.Entries()
                .Where(x => x.Entity is IAuditableEntity
                    && (x.State == System.Data.Entity.EntityState.Added || x.State == System.Data.Entity.EntityState.Modified));

            foreach (var entry in modifiedEntries)
            {
                IAuditableEntity entity = entry.Entity as IAuditableEntity;
                if (entity != null)
                {
                    string identityName = Thread.CurrentPrincipal.Identity.Name;
                    DateTime now = DateTime.UtcNow;

                    if (entry.State == System.Data.Entity.EntityState.Added)
                    {
                        entity.CreatedBy = identityName;
                        entity.CreatedDate = now;
                    }
                    else
                    {
                        base.Entry(entity).Property(x => x.CreatedBy).IsModified = false;
                        base.Entry(entity).Property(x => x.CreatedDate).IsModified = false;
                    }

                    entity.UpdatedBy = identityName;
                    entity.UpdatedDate = now;
                }
            }
            bool saveFailed;
            int retCount = 0;
            int ret = 0;
            do
            {
                saveFailed = false;
                retCount++;

                try
                {
                    ret = base.SaveChanges();
                }
                catch (System.Data.Entity.Infrastructure.DbUpdateConcurrencyException ex)
                {
                    saveFailed = true;
                    if (retCount > 3) throw ex;
                    // Update the values of the entity that failed to save 
                    // from the store
                    ex.Entries.Single().Reload();
                }

            } while (saveFailed);
            return ret;
        }
    }
}
