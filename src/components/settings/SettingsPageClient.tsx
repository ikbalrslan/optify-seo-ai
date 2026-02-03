"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, LogOut, Trash, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileUpdatedPopup } from "@/components/shared/ProfileUpdatedPopup";

import { ErrorPopup } from "@/components/shared/ErrorPopup";
import { SuccessPopup } from "@/components/shared/SuccessPopup";
import { Download, Plus, Globe, Trash2, CheckCircle2 } from "lucide-react";

interface WPSite {
  id: string;
  name: string;
  url: string;
  username: string;
  createdAt: Date;
}

interface SettingsPageClientProps {
  initialSubscription: any;
  initialName: string;
}

export default function SettingsPageClient({ initialSubscription, initialName }: SettingsPageClientProps) {
  const { data: session } = useSession();
  const [name, setName] = useState(initialName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);


  // WordPress Integrations State
  const [sites, setSites] = useState<WPSite[]>([]);
  const [isDidFetchSites, setIsDidFetchSites] = useState(false);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [newSiteUser, setNewSiteUser] = useState("");
  const [newSitePwd, setNewSitePwd] = useState("");
  const [connectError, setConnectError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  // Update local state when session loads
  // Fetch sites on load
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }

    if (session?.user?.email && !isDidFetchSites) {
      loadSites();
    }
  }, [session, isDidFetchSites]);

  // Subscription state
  const [subscription, setSubscription] = useState<any>(initialSubscription);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Client-side fetch removed as we pass it from server
  useEffect(() => {
    if (initialSubscription) {
      setSubscription(initialSubscription);
    }
  }, [initialSubscription]);

  const loadSites = async () => {
    try {
      const { getWordPressSites } = await import("@/actions/wordpress");
      const data = await getWordPressSites();
      setSites(data);
      setIsDidFetchSites(true);
    } catch (e) {
      console.error("Failed to load sites", e);
    }
  };

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      const { updateProfile } = await import("@/actions/update_profile");
      await updateProfile(name);
      await update({ name }); // Update client-side session

      // Trigger the success popup via URL parameter
      router.replace("/settings?profile_updated=true", { scroll: false });
    } catch (error) {
      console.error("Failed to update name:", error);
    } finally {
      setIsSaving(false);
    }
  };



  const handleConnectSite = async () => {
    setIsConnecting(true);
    setConnectError("");
    try {
      const { addWordPressSite } = await import("@/actions/wordpress");
      await addWordPressSite(newSiteUrl, newSiteUser, newSitePwd);
      await loadSites();
      setConnectOpen(false);
      // Reset form
      setNewSiteUrl("");
      setNewSiteUser("");
      setNewSitePwd("");
    } catch (error: any) {
      setConnectError(error.message || "Failed to connect site");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this site?")) return;
    try {
      const { deleteWordPressSite } = await import("@/actions/wordpress");
      await deleteWordPressSite(id);
      await loadSites();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="col-span-4 space-y-8 p-8 max-w-6xl mx-auto">
      <ProfileUpdatedPopup />
      <SuccessPopup
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Your API Key has been saved securely."
      />
      <SuccessPopup
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        message="Your API Key has been saved securely."
      />
      <ErrorPopup
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
        title="Invalid API Key"
      />


      <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Globe className="h-4 w-4" /> Integrations
          </TabsTrigger>
        </TabsList>

        <div className="max-w-5xl">


          <TabsContent value="general" className="space-y-6 mt-0">
            {/* Profile Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 pt-4 px-6">
                <CardTitle className="text-lg font-bold text-foreground">Profile</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar with Pro Badge */}
                  <div className="flex-shrink-0 relative">
                    {session?.user?.image ? (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border border-border">
                        <img
                          src={session.user.image}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border border-border">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {/* Pro Badge */}
                    {subscription?.isPro && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide">
                        Pro
                      </div>
                    )}
                  </div>

                  {/* Form */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-3">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10 text-[15px] rounded-lg border-input bg-background text-foreground"
                        placeholder="Your Name"
                      />
                      <Button
                        onClick={handleSaveName}
                        disabled={isSaving || !name || name === session?.user?.name}
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium w-24 h-10 rounded-lg shadow-none disabled:opacity-50"
                      >
                        {isSaving ? "..." : "Save"}
                      </Button>
                    </div>
                    <div className="text-[15px] text-muted-foreground pl-1">
                      {session?.user?.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-foreground">Subscription</CardTitle>
                {subscription?.isPro && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold uppercase tracking-wide">
                    Active
                  </span>
                )}
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Current Plan</p>
                    <div className="text-2xl font-bold text-foreground">
                      {subscription ? subscription.planName : "Loading..."}
                    </div>
                  </div>

                  <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold shadow-md">
                        {subscription?.isPro ? "Manage Plan" : "Upgrade Plan"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl w-full h-[90vh] overflow-y-auto p-0 bg-white">
                      {/* Import dynamic to avoid huge bundle or just standard import */}
                      <div className="p-4">
                        {/* We reuse the Pricing component here! */}
                        {/* Note: Pricing component has padding, we might want to adjust it or wrap it */}
                        <div className="relative">
                          <button
                            onClick={() => setUpgradeOpen(false)}
                            className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          {/* We need to import Pricing at top */}
                          <PricingModalContent />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Backlink Exchange Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-lg font-bold text-foreground">Backlink Exchange</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-muted-foreground">
                      Enable to participate in backlink exchanges with other Optify users. When enabled, your sites may receive backlinks from other users, and you&apos;ll contribute backlinks to their sites.
                    </p>
                  </div>
                  <BacklinkExchangeToggle />
                </div>
              </CardContent>
            </Card>


            {/* Footer Actions */}
            <div className="flex justify-end gap-6 pt-2">
              <button
                onClick={() => signOut({ callbackUrl: window.location.origin })}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
              <DeleteAccountModal email={session?.user?.email} />
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6 mt-0">
            {/* WordPress Integrations Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/icons/wordpress.png"
                      alt="WordPress"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">WordPress Integrations</CardTitle>
                </div>
                <a href="/plugins/optify-connector.zip" download className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Plugin
                </a>
              </CardHeader>
              <CardContent className="px-6 pb-6">

                {/* Connected Sites List */}
                <div className="space-y-3 mb-6">
                  {sites.length === 0 && (
                    <div className="text-sm text-muted-foreground italic p-4 border border-dashed border-border rounded-lg text-center">
                      No sites connected. Download the plugin and connect your first site.
                    </div>
                  )}
                  {sites.map(site => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-sm text-foreground">{site.name || site.url}</div>
                          <div className="text-xs text-muted-foreground">{site.url} • {site.username}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </div>
                        <button onClick={() => handleDeleteSite(site.id)} className="p-2 hover:bg-background rounded-full text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connect Button */}
                <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" /> Connect New Site
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect WordPress Site</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {connectError && (
                        <div className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-100 dark:border-red-900/50 mb-2">
                          {connectError}
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site URL</label>
                        <Input
                          placeholder="https://mysite.com"
                          value={newSiteUrl}
                          onChange={e => setNewSiteUrl(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input
                          placeholder="admin"
                          value={newSiteUser}
                          onChange={e => setNewSiteUser(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Application Password</label>
                        <Input
                          type="password"
                          placeholder="abcd 1234 efgh 5678"
                          value={newSitePwd}
                          onChange={e => setNewSitePwd(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Go to Users → Profile → Application Passwords in your WordPress admin to generate this.
                        </p>
                      </div>
                      <Button
                        onClick={handleConnectSite}
                        disabled={isConnecting}
                        className="w-full mt-2"
                      >
                        {isConnecting ? "Connecting..." : "Connect Site"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs >
    </div >
  );
}

// Wrapper for usage in Dialog avoids SSR issues with Importing directly inside?
// Actually simpler:
import { Pricing } from "@/components/landing/Pricing";

function PricingModalContent() {
  return (
    <div className="pt-8">
      <Pricing />
    </div>
  );
}

function DeleteAccountModal({ email }: { email?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Import dynamically or define deleteAccount action (assuming it's imported)
  // For this snippet, I'll rely on the top-level import which I need to add.
  // But since I can't easily add top-level imports in this chunk, I will use a separate replace for imports.
  // Wait, I can't use the action if I don't import it. 
  // I'll define the UI first, effectively.

  const handleDelete = async () => {
    if (confirmEmail !== email) return;
    setIsDeleting(true);
    try {
      // Dynamic import to avoid top-level conflict in this chunk if strictly checking, 
      // but cleaner to add import at top. I'll simply call the imported function (assuming I add the import next).
      const { deleteAccount } = await import("@/actions/delete_account");
      await deleteAccount();
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-destructive transition-colors">
          <Trash className="h-4 w-4" />
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-8 bg-background rounded-2xl border-none shadow-2xl">
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Optify says
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="text-lg">⚠</span>
              <span className="text-sm font-bold tracking-wide">PERMANENT DELETION WARNING</span>
              <span className="text-lg">⚠</span>
            </div>

            <p className="text-foreground text-[15px] leading-relaxed">
              This will permanently delete your account. This action CANNOT be undone.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-[15px] text-foreground">
                Type &quot;{email}&quot; to confirm:
              </label>
              <Input
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="h-11 rounded-xl border-2 border-[#5F6317] focus-visible:ring-0 focus-visible:border-[#5F6317] text-lg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-11 w-32 rounded-full bg-[#EAECC6] hover:bg-[#E0E2B0] text-[#4A4D12] font-semibold text-[15px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={confirmEmail !== email || isDeleting}
                className="h-11 w-32 rounded-full bg-[#5F6317] hover:bg-[#4E5113] text-white font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "..." : "OK"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}

function BacklinkExchangeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { getBacklinkExchangeStatus } = await import("@/actions/settings");
        const status = await getBacklinkExchangeStatus();
        setEnabled(status);
      } catch (e) {
        console.error("Failed to load backlink exchange status", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, []);

  const handleToggle = async (newValue: boolean) => {
    setIsSaving(true);
    try {
      const { updateBacklinkExchange } = await import("@/actions/settings");
      await updateBacklinkExchange(newValue);
      setEnabled(newValue);
    } catch (e) {
      console.error("Failed to update backlink exchange", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="w-11 h-6 bg-muted rounded-full animate-pulse" />;
  }

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => handleToggle(!enabled)}
      disabled={isSaving}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${enabled ? "bg-[#1DB954]" : "bg-input"
        }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
      />
    </button>
  );
}
