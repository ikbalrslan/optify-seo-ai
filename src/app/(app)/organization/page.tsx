import { getActiveOrganization } from "@/lib/org";
import TeamPageClient from "@/components/organization/TeamPageClient";
import { NoOrganizationState } from "@/components/organization/NoOrganizationState";

export default async function OrganizationPage() {
    const organization = await getActiveOrganization();

    if (!organization) {
        return <NoOrganizationState />;
    }

    return <TeamPageClient organizationId={organization.id} organizationName={organization.name} />;
}
