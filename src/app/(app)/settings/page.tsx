"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, LogOut, Trash, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");

  // Update local state when session loads
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-[#1a1a1a] mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-48 flex-shrink-0 space-y-1">
          <button className="w-full text-left px-4 py-2.5 bg-[#1a1a1a] text-white rounded-lg font-medium text-sm">
            General
          </button>
          <button className="w-full text-left px-4 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
            More
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 max-w-2xl">
          {/* Profile Card */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-[#1a1a1a]">Profile</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {session?.user?.image ? (
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border border-slate-100">
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                      <User className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 text-[15px] rounded-lg border-slate-200"
                      placeholder="Your Name"
                    />
                    <Button className="bg-[#d4d4d4] hover:bg-[#c0c0c0] text-slate-700 font-medium px-5 h-10 rounded-lg shadow-none">
                      Save
                    </Button>
                  </div>
                  <div className="text-[15px] text-slate-500 pl-1">
                    {session?.user?.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Card */}
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-[#1a1a1a]">Theme</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <select className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E55F37]/20 focus:border-[#E55F37] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
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
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#1a1a1a] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <DeleteAccountModal email={session?.user?.email} />
          </div>
        </div>
      </div>
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
        <button className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a] hover:text-red-600 transition-colors">
          <Trash className="h-4 w-4" />
          Delete
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-8 bg-white rounded-2xl border-none shadow-2xl">
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
              Optify says
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#1a1a1a] font-medium">
              <span className="text-lg">⚠</span>
              <span className="text-sm font-bold tracking-wide">PERMANENT DELETION WARNING</span>
              <span className="text-lg">⚠</span>
            </div>

            <p className="text-[#1a1a1a] text-[15px] leading-relaxed">
              This will permanently delete your account. This action CANNOT be undone.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-[15px] text-[#1a1a1a]">
                Type "{email}" to confirm:
              </label>
              <Input
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="h-11 rounded-xl border-2 border-[#5F6317] focus-visible:ring-0 focus-visible:border-[#5F6317] text-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-11 px-6 rounded-full bg-[#EAECC6] hover:bg-[#E0E2B0] text-[#4A4D12] font-semibold text-[15px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={confirmEmail !== email || isDeleting}
              className="h-11 px-8 rounded-full bg-[#5F6317] hover:bg-[#4E5113] text-white font-semibold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "OK"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
