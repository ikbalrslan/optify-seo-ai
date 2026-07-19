import { getSubscription } from "@/actions/subscription";
import { getOrgAutopilotQuota } from "@/actions/autopilot";
import { getActiveOrganization } from "@/lib/org";
import { AppLayoutClient } from "@/components/shared/AppLayoutClient";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch subscription and quota data server-side
  const [subscription, quota, organization] = await Promise.all([
    getSubscription(),
    getOrgAutopilotQuota(),
    getActiveOrganization(),
  ]);

  return (
    <AppLayoutClient
      subscription={subscription}
      quota={quota}
      organizationId={organization?.id ?? null}
    >
      {children}
    </AppLayoutClient>
  );
}
