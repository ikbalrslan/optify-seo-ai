
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyzerPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SEO Analyzer</h1>
        <p className="text-muted-foreground">
          Enter a URL to generate a comprehensive SEO report.
        </p>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-12 text-lg"
              disabled={loading}
            />
            <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center">
               <AlertTriangle className="h-4 w-4 mr-2" />
               {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Overview Score Cards */}
           {/* Lighthouse Scores */}
           {result.lighthouse && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-orange-50 border-orange-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-700">{result.lighthouse.performance}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">Accessibility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-700">{result.lighthouse.accessibility}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">Best Practices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-700">{result.lighthouse.bestPractices}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-700">SEO</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-700">{result.lighthouse.seo}</div>
                        </CardContent>
                    </Card>
               </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">HTTP Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-2xl font-bold">{result.status} OK</span>
                      </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Headings</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{result.headings.h1.length + result.headings.h2.length + result.headings.h3.length}</div>
                      <p className="text-xs text-muted-foreground">Total H1-H3 Tags</p>
                  </CardContent>
              </Card>
               <Card>
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Technical Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                              <span>robots.txt</span>
                               {result.files.robotsTxt ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                              <span>sitemap.xml</span>
                               {result.files.sitemapXml ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                      </div>
                  </CardContent>
              </Card>
           </div>

           <Tabs defaultValue="meta" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="meta">Metadata</TabsTrigger>
                <TabsTrigger value="headings">Headings</TabsTrigger>
                <TabsTrigger value="links">Links ({result.links.internal.length + result.links.external.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="meta" className="mt-4">
                 <Card>
                     <CardHeader>
                         <CardTitle>Meta Tags</CardTitle>
                         <CardDescription>Search engine appearance</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <div>
                             <h4 className="text-sm font-medium mb-1">Title Tag</h4>
                             <div className="p-3 bg-muted rounded-md text-sm">
                                 {result.meta.title || <span className="text-muted-foreground italic">Missing</span>}
                             </div>
                         </div>
                         <div>
                             <h4 className="text-sm font-medium mb-1">Meta Description</h4>
                             <div className="p-3 bg-muted rounded-md text-sm">
                                 {result.meta.description || <span className="text-muted-foreground italic">Missing</span>}
                             </div>
                         </div>
                         <div>
                             <h4 className="text-sm font-medium mb-1">Canonical URL</h4>
                             <div className="p-3 bg-muted rounded-md text-sm break-all">
                                 {result.meta.canonical || <span className="text-muted-foreground italic">Missing</span>}
                             </div>
                         </div>
                     </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="headings" className="mt-4">
                 <Card>
                     <CardHeader>
                         <CardTitle>Heading Structure</CardTitle>
                         <CardDescription>Content hierarchy</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {result.headings.h1.length > 0 ? (
                             result.headings.h1.map((h1: string, i: number) => (
                                 <div key={i} className="flex items-start">
                                     <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-2 font-mono">H1</span>
                                     <span className="text-sm font-medium">{h1}</span>
                                 </div>
                             ))
                         ) : (
                             <div className="text-destructive text-sm flex items-center">
                                 <XCircle className="h-4 w-4 mr-2" /> Missing H1 Tag!
                             </div>
                         )}
                         <div className="pl-4 border-l-2 border-muted space-y-2 mt-2">
                             {result.headings.h2.map((h2: string, i: number) => (
                                 <div key={i} className="flex items-start">
                                     <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded mr-2 font-mono">H2</span>
                                     <span className="text-sm">{h2}</span>
                                 </div>
                             ))}
                         </div>
                     </CardContent>
                 </Card>
              </TabsContent>
              <TabsContent value="links" className="mt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle>Analyzed Links</CardTitle>
                          <CardDescription>Internal ({result.links.internal.length}) & External ({result.links.external.length}) links found.</CardDescription>
                      </CardHeader>
                      <CardContent>
                           <h4 className="text-sm font-medium mb-2">External Links</h4>
                           <div className="bg-muted p-4 rounded-md h-40 overflow-y-auto mb-4 space-y-1">
                               {result.links.external.length > 0 ? result.links.external.map((link: string, i: number) => (
                                   <div key={i} className="text-xs truncate text-muted-foreground hover:text-foreground">
                                       <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                   </div>
                               )) : <span className="text-xs text-muted-foreground">No external links found.</span>}
                           </div>

                           <h4 className="text-sm font-medium mb-2">Internal Links (Top 50)</h4>
                           <div className="bg-muted p-4 rounded-md h-40 overflow-y-auto space-y-1">
                               {result.links.internal.length > 0 ? result.links.internal.slice(0, 50).map((link: string, i: number) => (
                                   <div key={i} className="text-xs truncate text-muted-foreground">
                                       {link}
                                   </div>
                               )) : <span className="text-xs text-muted-foreground">No internal links found.</span>}
                           </div>
                      </CardContent>
                  </Card>
              </TabsContent>
           </Tabs>
        </div>
      )}
    </div>
  );
}
