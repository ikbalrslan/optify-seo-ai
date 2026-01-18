"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, LogOut, Trash, User, Key } from "lucide-react";
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
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

  const handleSaveApiKey = async () => {
    setIsSavingKey(true);
    try {
      const { updateApiKey } = await import("@/actions/settings");
      await updateApiKey(apiKey);
      setApiKey(""); // Clear after save for security
      setSuccessOpen(true);
    } catch (error) {
      console.error("Failed to update API key:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to save API Key");
      }
      setErrorOpen(true);
    } finally {
      setIsSavingKey(false);
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

      <Tabs defaultValue="general" className="space-y-8">
        <TabsList className="bg-transparent p-0 w-full justify-start border-b border-border space-x-6 h-auto rounded-none">
          <TabsTrigger
            value="general"
            className="w-40 justify-center px-4 h-9 text-sm font-medium flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-none"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="w-40 justify-center px-4 h-9 text-sm font-medium flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-none"
          >
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="api-keys"
            className="w-40 justify-center px-4 h-9 text-sm font-medium flex-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-none"
          >
            API Keys
          </TabsTrigger>
        </TabsList>

        <div className="max-w-5xl">
          <TabsContent value="api-keys" className="space-y-6 mt-0">
            {/* API Key Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 pt-4 px-6">
                <CardTitle className="text-lg font-bold text-foreground">LLM API Key</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center border border-border">
                      <Key className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-3">
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="h-10 text-[15px] rounded-lg border-input bg-background"
                        placeholder="Search sk-or-... or AIza..."
                      />
                      <Button
                        onClick={handleSaveApiKey}
                        disabled={isSavingKey || !apiKey}
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium w-24 h-10 rounded-lg shadow-none disabled:opacity-50"
                      >
                        {isSavingKey ? "..." : "Save"}
                      </Button>
                    </div>
                    <div className="text-[13px] text-muted-foreground pl-1">
                      Supports OpenAI (sk-proj...), OpenRouter (sk-or-...), and Google (AIza...).
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6 mt-0">
            {/* Profile Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 pt-4 px-6">
                <CardTitle className="text-lg font-bold text-foreground">Profile</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
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

            {/* Theme Card */}
            <Card className="rounded-xl border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-lg font-bold text-foreground">Theme</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <select className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-foreground">
                  <option value="system">🧁 System</option>
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                </select>
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <div className="flex justify-end gap-6 pt-2">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
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
                  <div className="h-10 w-10 rounded-full bg-[#21759b]/10 flex items-center justify-center border border-[#21759b]/20">
                    {/* Official WordPress Logo */}
                    <svg className="h-6 w-6 fill-[#21759b]" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
                      <title>WordPress</title>
                      <path d="M12.035 0C5.405 0 0 5.405 0 12.035c0 5.56 3.793 10.25 8.966 11.63L3.889 10.4c-.178-.528-.27-1.097-.27-1.686 0-2.31 1.874-4.185 4.185-4.185 1.157 0 2.221.463 3.003 1.226.042.04.093.078.14.111.047-.033.097-.071.14-.111.78-.763 1.846-1.226 3.002-1.226 2.31 0 4.185 1.874 4.185 4.185 0 .589-.093 1.157-.27 1.685L12.924 23.66c5.225-.972 9.11-5.596 9.11-11.12 0-3.712-1.579-7.056-4.117-9.423a11.96 11.96 0 0 0-5.882-2.582zm-1.84 13.442l-3.352 9.208c-.287.051-.58.093-.878.113l4.23-9.321zm7.404.004l4.218 9.308c-.295-.02-.584-.061-.87-.111l-3.348-9.197zM2.518 12.035c0 .356.035.705.101 1.044l4.632 12.72c-2.924-1.674-4.733-4.832-4.733-8.369V12.035zm19.043 0c0 3.53-1.802 6.685-4.717 8.36l4.618-12.725c.066-.34.1-.688.1-1.043V12.035z" />
                    </svg>
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
      </Tabs>
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
