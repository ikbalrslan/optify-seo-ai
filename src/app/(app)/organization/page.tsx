import { getActiveOrganization } from "@/lib/org";
import TeamPageClient from "@/components/organization/TeamPageClient";

export default async function OrganizationPage() {
    const organization = await getActiveOrganization();

    if (!organization) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900">No organization found</h3>
                <p className="text-slate-500">Something went wrong setting up your account. Please contact support.</p>
            </div>
        );
    }

    return <TeamPageClient organizationId={organization.id} organizationName={organization.name} />;
}
