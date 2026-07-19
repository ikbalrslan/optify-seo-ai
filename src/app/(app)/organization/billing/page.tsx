import { getActiveOrganization } from "@/lib/org";
import BillingPageClient from "@/components/organization/BillingPageClient";
import { NoOrganizationState } from "@/components/organization/NoOrganizationState";

export default async function BillingPage() {
    const organization = await getActiveOrganization();

    if (!organization) {
        return <NoOrganizationState />;
    }

    return <BillingPageClient organizationId={organization.id} />;
}
