"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Star,
  Clock,
  Zap,
  Plus,
  Search,
  HelpCircle,
  Trash2,
  CalendarPlus,
  ArrowUpDown,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getKeywords,
  getKeywordStats,
  deleteKeyword,
  toggleStarKeyword,
  bulkCreateKeywords,
  type KeywordFilter,
  type KeywordStats,
} from "@/actions/keywords";
import { quickScheduleKeyword } from "@/actions/autopilot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

type Keyword = {
  id: string;
  keyword: string;
  opportunity: string;
  difficulty: number;
  volume: number;
  cpc: number;
  isStarred: boolean;
  isQueued: boolean;
  isGenerated: boolean;
  createdAt: Date;
};

type SortConfig = {
  key: keyof Keyword;
  order: "asc" | "desc";
};

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [stats, setStats] = useState<KeywordStats>({ all: 0, recommended: 0, starred: 0, queued: 0, generated: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [filter, setFilter] = useState<KeywordFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "createdAt", order: "desc" });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const [keywordsData, statsData] = await Promise.all([
        getKeywords(filter, debouncedSearch, sortConfig.key, sortConfig.order),
        getKeywordStats(),
      ]);
      setKeywords(keywordsData as Keyword[]);
      setStats(statsData);
    } catch (e) {
      console.error("Failed to load keywords", e);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [filter, debouncedSearch, sortConfig]);

  // Initial load
  useEffect(() => {
    loadData(isInitialLoad);
  }, [filter, sortConfig, debouncedSearch]);

  // Debounced search - only update debouncedSearch after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (key: keyof Keyword) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleStar = async (id: string) => {
    // Optimistic update - update UI immediately
    setKeywords(prev =>
      prev.map(kw =>
        kw.id === id ? { ...kw, isStarred: !kw.isStarred } : kw
      )
    );
    // Update stats optimistically
    setStats(prev => {
      const keyword = keywords.find(k => k.id === id);
      if (!keyword) return prev;
      return {
        ...prev,
        starred: keyword.isStarred ? prev.starred - 1 : prev.starred + 1,
      };
    });

    try {
      await toggleStarKeyword(id);
    } catch (e) {
      console.error("Failed to toggle star", e);
      // Revert on error
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this keyword?")) return;
    // Optimistic update
    setKeywords(prev => prev.filter(kw => kw.id !== id));
    setStats(prev => ({ ...prev, all: prev.all - 1 }));

    try {
      await deleteKeyword(id);
    } catch (e) {
      console.error("Failed to delete", e);
      // Revert on error
      loadData();
    }
  };

  const [schedulingKeyword, setSchedulingKeyword] = useState<string | null>(null);
  const [scheduleSuccess, setScheduleSuccess] = useState<{ keyword: string; date: Date } | null>(null);

  const handleAddToCalendar = async (keyword: string) => {
    setSchedulingKeyword(keyword);
    try {
      const result = await quickScheduleKeyword(keyword);
      setScheduleSuccess({ keyword, date: result.scheduledDate });
      // Clear success message after 3 seconds
      setTimeout(() => setScheduleSuccess(null), 3000);
    } catch (e: any) {
      alert(e.message || "Failed to schedule keyword");
    } finally {
      setSchedulingKeyword(null);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkKeywords.trim()) return;
    setIsSubmitting(true);
    try {
      const keywordsArray = bulkKeywords.split("\n").map(k => k.trim()).filter(k => k);
      await bulkCreateKeywords(keywordsArray);
      setBulkKeywords("");
      setIsAddModalOpen(false);
      loadData();
    } catch (e) {
      console.error("Failed to add keywords", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOpportunityBadge = (opportunity: string) => {
    const styles: Record<string, string> = {
      High: "bg-green-100 text-green-700",
      Medium: "bg-yellow-100 text-yellow-700",
      Low: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", styles[opportunity] || styles.Medium)}>
        {opportunity}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: number) => {
    let color = "bg-green-100 text-green-700";
    if (difficulty > 60) color = "bg-red-100 text-red-700";
    else if (difficulty > 30) color = "bg-yellow-100 text-yellow-700";
    return (
      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", color)}>
        {difficulty}
      </span>
    );
  };

  const statCards = [
    { label: "All Keywords", value: stats.all, description: "Complete keyword list", icon: FileText, filter: "all" as const },
    { label: "Recommended", value: stats.recommended, description: "First keywords to target", icon: Zap, filter: "recommended" as const },
    { label: "Starred", value: stats.starred, description: "Your starred keywords", icon: Star, filter: "starred" as const },
    { label: "Queued", value: stats.queued, description: "Ready for generation", icon: Clock, filter: "queued" as const },
    { label: "Generated", value: stats.generated, description: "Your generated keywords", icon: Zap, filter: "generated" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-[#1DB954]" />
          Keywords
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your keywords and articles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            onClick={() => setFilter(card.filter)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all hover:shadow-md",
              filter === card.filter
                ? "border-[#1DB954] bg-[#1DB954]/5"
                : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <card.icon className="h-5 w-5 text-slate-400 mb-2" />
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="text-sm font-medium text-slate-700">{card.label}</div>
            <div className="text-xs text-slate-500">{card.description}</div>
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Section Header */}
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">
            {filter === "recommended" ? "Recommended Keywords" :
              filter === "starred" ? "Starred Keywords" :
                filter === "queued" ? "Queued Keywords" :
                  filter === "generated" ? "Generated Keywords" : "All Keywords"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {filter === "recommended"
              ? "These are all keywords we recommend to target and generate first based on our smart algorithm."
              : "Manage your keyword library to expand your content strategy."}
          </p>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Keywords
          </Button>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-slate-500 ml-auto">
            Showing {keywords.length} of {stats.all} keywords
          </span>
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-500">
                <HelpCircle className="h-4 w-4 mr-1" />
                Metrics Guide
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" align="end">
              <h3 className="font-semibold mb-2">Metrics Guide</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Opportunity:</span>
                  <span className="text-slate-500 ml-1">High/Medium/Low based on volume and competition</span>
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span>
                  <span className="text-slate-500 ml-1">0-100 score, lower is easier to rank</span>
                </div>
                <div>
                  <span className="font-medium">Volume:</span>
                  <span className="text-slate-500 ml-1">Monthly search volume</span>
                </div>
                <div>
                  <span className="font-medium">CPC:</span>
                  <span className="text-slate-500 ml-1">Cost per click in ads ($)</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Table */}
        {isInitialLoad ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#1DB954]" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <FileText className="h-12 w-12 mb-3 text-slate-300" />
            <p>No keywords found</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Keywords
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    <button onClick={() => handleSort("keyword")} className="flex items-center gap-1 hover:text-slate-900">
                      Keyword
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    <button onClick={() => handleSort("opportunity")} className="flex items-center gap-1 hover:text-slate-900">
                      Opportunity
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    <button onClick={() => handleSort("difficulty")} className="flex items-center gap-1 hover:text-slate-900">
                      Difficulty
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    <button onClick={() => handleSort("volume")} className="flex items-center gap-1 hover:text-slate-900">
                      Volume
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    <button onClick={() => handleSort("cpc")} className="flex items-center gap-1 hover:text-slate-900">
                      CPC
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStar(kw.id)}
                          className={cn(
                            "transition-colors",
                            kw.isStarred ? "text-yellow-500" : "text-slate-300 hover:text-yellow-500"
                          )}
                        >
                          <Star className="h-4 w-4" fill={kw.isStarred ? "currentColor" : "none"} />
                        </button>
                        <span className="font-medium text-slate-900">{kw.keyword}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getOpportunityBadge(kw.opportunity)}</td>
                    <td className="px-4 py-3">{getDifficultyBadge(kw.difficulty)}</td>
                    <td className="px-4 py-3 text-slate-700">{kw.volume.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-700">${kw.cpc.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToCalendar(kw.keyword)}
                          disabled={schedulingKeyword === kw.keyword}
                          className="text-[#1DB954] hover:text-[#1DB954] hover:bg-[#1DB954]/10"
                        >
                          {schedulingKeyword === kw.keyword ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CalendarPlus className="h-4 w-4 mr-1" />
                          )}
                          {schedulingKeyword === kw.keyword ? "Scheduling..." : "Add to Calendar"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDelete(kw.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Keywords Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Keywords</DialogTitle>
            <DialogDescription>
              Enter keywords one per line. You can paste a list of keywords.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter keywords, one per line..."
              value={bulkKeywords}
              onChange={(e) => setBulkKeywords(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-slate-500 mt-2">
              {bulkKeywords.split("\n").filter(k => k.trim()).length} keywords
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAdd} disabled={isSubmitting || !bulkKeywords.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Keywords
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      {scheduleSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 z-50">
          <CalendarPlus className="h-5 w-5" />
          <div>
            <p className="font-medium">Scheduled!</p>
            <p className="text-sm opacity-90">
              "{scheduleSuccess.keyword}" scheduled for {scheduleSuccess.date.toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
