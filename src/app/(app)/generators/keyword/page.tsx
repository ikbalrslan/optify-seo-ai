"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, TrendingUp, Flame, Loader2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProjects, createProject, updateProjectAutopilotSettings } from "@/actions/projects";
import { discoverKeywords, promoteSnapshotToKeyword } from "@/actions/keyword-discovery";
import { getConnectedSites } from "@/actions/wordpress";
import { COUNTRIES } from "@/config/countries";

const BLOG_TARGET = "BLOG";

type Project = {
  id: string;
  name: string;
  domain: string;
  country: string;
  autopilotEnabled: boolean;
  autopilotSeedKeyword: string | null;
  autopilotConnectedSiteId: string | null;
};

type Snapshot = {
  id: string;
  relatedQuery: string;
  relativeValue: number;
  rawGrowthLabel: string | null;
};

export default function KeywordGeneratorPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // New project form
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("");
  const [newProjectCountry, setNewProjectCountry] = useState("US");
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Discovery
  const [seedKeyword, setSeedKeyword] = useState("");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [topQueries, setTopQueries] = useState<Snapshot[]>([]);
  const [risingQueries, setRisingQueries] = useState<Snapshot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // Autopilot settings for the selected project
  const [sites, setSites] = useState<any[]>([]);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [autopilotTarget, setAutopilotTarget] = useState<string>(BLOG_TARGET);
  const [isSavingAutopilot, setIsSavingAutopilot] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const data = await getProjects();
      setProjects(data as Project[]);
      setSelectedProjectId(prev => prev || (data.length > 0 ? data[0].id : ""));
    } catch (e) {
      console.error("Failed to load projects", e);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Connected sites are per-project now - reload whenever the selected project changes so the
  // autopilot target picker only ever offers sites that actually belong to it.
  useEffect(() => {
    if (!selectedProjectId) {
      setSites([]);
      return;
    }
    getConnectedSites(selectedProjectId).then(setSites).catch(e => console.error("Failed to load sites", e));
  }, [selectedProjectId]);

  // Sync the autopilot panel whenever the selected project changes
  useEffect(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
      setAutopilotEnabled(project.autopilotEnabled);
      setAutopilotTarget(project.autopilotConnectedSiteId ?? BLOG_TARGET);
      if (project.autopilotSeedKeyword && !seedKeyword) {
        setSeedKeyword(project.autopilotSeedKeyword);
      }
    }
  }, [selectedProjectId, projects]);

  // "Internal Blog" publishes to Optify's own shared /blog - staff-only (see
  // processDueScheduledPosts in src/actions/autopilot.ts). Non-admins can't select or keep it;
  // fall back to the first connected site once one loads, matching SchedulePostModal's fix.
  useEffect(() => {
    if (!isAdmin && autopilotTarget === BLOG_TARGET && sites.length > 0) {
      setAutopilotTarget(sites[0].id);
    }
  }, [isAdmin, autopilotTarget, sites]);

  const handleSaveAutopilot = async () => {
    if (!selectedProjectId) return;
    setIsSavingAutopilot(true);
    try {
      await updateProjectAutopilotSettings(selectedProjectId, {
        autopilotEnabled,
        autopilotSeedKeyword: seedKeyword,
        autopilotConnectedSiteId: autopilotTarget === BLOG_TARGET ? null : autopilotTarget,
      });
      await loadProjects();
    } catch (e: any) {
      alert(e.message || "Failed to save autopilot settings");
    } finally {
      setIsSavingAutopilot(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !newProjectDomain.trim()) return;
    setIsCreatingProject(true);
    try {
      const project = await createProject(newProjectName, newProjectDomain, newProjectCountry);
      setNewProjectName("");
      setNewProjectDomain("");
      await loadProjects();
      setSelectedProjectId(project.id);
    } catch (e: any) {
      alert(e.message || "Failed to create site");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleDiscover = async () => {
    if (!selectedProjectId || !seedKeyword.trim()) return;
    setIsDiscovering(true);
    setError(null);
    setPromotedIds(new Set());
    try {
      const result = await discoverKeywords(selectedProjectId, seedKeyword);
      if (!result.success) {
        setError(result.error);
        setTopQueries([]);
        setRisingQueries([]);
      } else {
        setTopQueries(result.top as Snapshot[]);
        setRisingQueries(result.rising as Snapshot[]);
      }
    } catch (e: any) {
      setError(e.message || "Failed to discover keywords");
      setTopQueries([]);
      setRisingQueries([]);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handlePromote = async (snapshotId: string) => {
    setPromotingId(snapshotId);
    try {
      await promoteSnapshotToKeyword(snapshotId);
      setPromotedIds(prev => new Set(prev).add(snapshotId));
    } catch (e: any) {
      alert(e.message || "Failed to add keyword");
    } finally {
      setPromotingId(null);
    }
  };

  const renderResultTable = (rows: Snapshot[], emptyLabel: string) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
          {emptyLabel}
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Query</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Signal</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{row.relatedQuery}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {row.rawGrowthLabel ?? row.relativeValue}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={promotingId === row.id || promotedIds.has(row.id)}
                    onClick={() => handlePromote(row.id)}
                    className="text-[#1DB954] hover:text-[#1DB954] hover:bg-[#1DB954]/10"
                  >
                    {promotingId === row.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : promotedIds.has(row.id) ? (
                      <Check className="h-4 w-4 mr-1" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    {promotedIds.has(row.id) ? "Added" : "Add to My Keywords"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-[#1DB954]" />
          Keyword Generator
        </h1>
        <p className="text-slate-500 mt-1">
          Discover real top and rising keywords for your site, by country, powered by Google Trends.
        </p>
      </div>

      {isLoadingProjects ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#1DB954]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg">
          <h2 className="font-semibold text-slate-900 mb-1">Create your first site</h2>
          <p className="text-sm text-slate-500 mb-4">
            Keywords are tracked per site. Add the site you want to discover keywords for.
          </p>
          <div className="space-y-3">
            <Input placeholder="Site name (e.g. Optifyseo)" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} />
            <Input placeholder="Domain (e.g. optifyseo.ai)" value={newProjectDomain} onChange={e => setNewProjectDomain(e.target.value)} />
            <Select value={newProjectCountry} onValueChange={setNewProjectCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreateProject}
              disabled={isCreatingProject || !newProjectName.trim() || !newProjectDomain.trim()}
              className="w-full"
            >
              {isCreatingProject ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Site
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Site</label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select site..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.country})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-[240px]">
              <label className="text-sm font-medium">Seed keyword / topic</label>
              <Input
                placeholder="e.g. seo audit tool"
                value={seedKeyword}
                onChange={e => setSeedKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleDiscover()}
              />
            </div>
            <Button onClick={handleDiscover} disabled={isDiscovering || !seedKeyword.trim()}>
              {isDiscovering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Discover
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Fully-autonomous monthly autopilot */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-slate-900">Monthly Autopilot</h2>
                <p className="text-sm text-slate-500">
                  Automatically discover rising keywords for this site every month and schedule posts, no manual picking required.
                </p>
              </div>
              <button
                role="switch"
                aria-checked={autopilotEnabled}
                disabled={!autopilotEnabled && !isAdmin && sites.length === 0}
                onClick={() => setAutopilotEnabled(v => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${autopilotEnabled ? "bg-[#1DB954]" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${autopilotEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            {!isAdmin && sites.length === 0 && (
              <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                Connect a WordPress site to enable Monthly Autopilot - the internal blog (optifyseo.ai) is staff-only.
              </p>
            )}
            {autopilotEnabled && (
              <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Publish to</label>
                  <Select value={autopilotTarget} onValueChange={setAutopilotTarget}>
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {isAdmin && <SelectItem value={BLOG_TARGET}>Internal Blog (no site connected)</SelectItem>}
                      {sites.map(site => (
                        <SelectItem key={site.id} value={site.id}>{site.name || site.url}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-slate-500 flex-1 min-w-[200px]">
                  Uses the seed keyword above and this site&apos;s country. Runs on the 1st of each month, within your plan&apos;s post limit.
                </p>
              </div>
            )}
            <Button
              onClick={handleSaveAutopilot}
              disabled={isSavingAutopilot || (autopilotEnabled && !seedKeyword.trim())}
              size="sm"
              className="mt-3"
            >
              {isSavingAutopilot ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Autopilot Settings
            </Button>
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Rising Queries
            </h2>
            {renderResultTable(risingQueries, "Discover a seed keyword to see rising queries here.")}
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#1DB954]" />
              Top Queries
            </h2>
            {renderResultTable(topQueries, "Discover a seed keyword to see top queries here.")}
          </div>
        </>
      )}
    </div>
  );
}
