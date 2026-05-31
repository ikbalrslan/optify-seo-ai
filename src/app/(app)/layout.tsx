import { getSubscription } from "@/actions/subscription";
import { getAutopilotQuota } from "@/actions/autopilot";
import { AppLayoutClient } from "@/components/shared/AppLayoutClient";

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch subscription and quota data server-side
  const [subscription, quota] = await Promise.all([
    getSubscription(),
    getAutopilotQuota()
  ]);

  return (
    <AppLayoutClient
      subscription={subscription}
      quota={quota}
    >
      {children}
    </AppLayoutClient>
  );
}
