using BTO.Model;
using BTO.Model.Common;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens;
using System.Linq;
using System.Web;

namespace BTO.Admin.Utils
{
    public class DatabaseIssuerNameRegistry : ValidatingIssuerNameRegistry
    {

        public static bool ContainsTenant(string tenantId)
        {
            using (BTOContext context = new BTOContext())
            {
                return context.Tenants
                    .Where(tenant => tenant.Id == tenantId)
                    .Any();
            }
        }

        public static bool ContainsKey(string thumbprint)
        {
            using (BTOContext context = new BTOContext())
            {
                return context.IssuingAuthorityKeys
                    .Where(key => key.Id == thumbprint)
                    .Any();
            }
        }

        public static void RefreshKeys(string metadataLocation)
        {
            IssuingAuthority issuingAuthority = ValidatingIssuerNameRegistry.GetIssuingAuthority(metadataLocation);

            bool newKeys = false;
            bool refreshTenant = false;
            foreach (string thumbprint in issuingAuthority.Thumbprints)
            {
                if (!ContainsKey(thumbprint))
                {
                    newKeys = true;
                    refreshTenant = true;
                    break;
                }
            }

            foreach (string issuer in issuingAuthority.Issuers)
            {
                if (!ContainsTenant(GetIssuerId(issuer)))
                {
                    refreshTenant = true;
                    break;
                }
            }

            if (newKeys || refreshTenant)
            {
                using (BTOContext context = new BTOContext())
                {
                    if (newKeys)
                    {
                        context.IssuingAuthorityKeys.RemoveRange(context.IssuingAuthorityKeys);
                        foreach (string thumbprint in issuingAuthority.Thumbprints)
                        {
                            context.IssuingAuthorityKeys.Add(new IssuingAuthorityKey { Id = thumbprint });
                        }
                    }

                    if (refreshTenant)
                    {
                        foreach (string issuer in issuingAuthority.Issuers)
                        {
                            string issuerId = GetIssuerId(issuer);
                            if (!ContainsTenant(issuerId))
                            {
                                context.Tenants.Add(new Tenant { Id = issuerId });
                            }
                        }
                    }
                    context.SaveChanges();
                }
            }
        }

        private static string GetIssuerId(string issuer)
        {
            return issuer.TrimEnd('/').Split('/').Last();
        }

        protected override bool IsThumbprintValid(string thumbprint, string issuer)
        {
            return ContainsTenant(GetIssuerId(issuer))
                && ContainsKey(thumbprint);
        }
    }
}