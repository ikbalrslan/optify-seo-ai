import { auth } from "@/auth";
import { getSubscription } from "@/actions/subscription";
import SettingsPageClient from "@/components/settings/SettingsPageClient";

export default async function SettingsPage() {
    const session = await auth();
    const subscription = await getSubscription();

    return (
        <SettingsPageClient 
            initialSubscription={subscription} 
            initialName={session?.user?.name || ""}
        />
    );
}
