using System.Data.Entity;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace BTO.Admin.Models
{
    public class ApplicationDbAdminContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbAdminContext()
            : base("BTOContext", throwIfV1Schema: false)
        {
        }

        public static ApplicationDbAdminContext Create()
        {
            return new ApplicationDbAdminContext();
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>().ToTable("admin_AspNetUsers");

            modelBuilder.Entity<IdentityRole>().ToTable("admin_AspNetRoles");

            modelBuilder.Entity<IdentityUserRole>().ToTable("admin_AspNetUserRoles");
            modelBuilder.Entity<IdentityUserClaim>().ToTable("admin_AspNetUserClaims");
            modelBuilder.Entity<IdentityUserLogin>().ToTable("admin_AspNetUserLogins");

        }
    }
}