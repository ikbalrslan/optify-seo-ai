
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Globe, Search, TrendingUp } from "lucide-react";
import { UsageChart } from "@/components/dashboard/UsageChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
            {/* Add DatePicker or Actions here */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average SEO Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78/100</div>
            <p className="text-xs text-muted-foreground">
              +5% improvement
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pages Crawled
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Across 3 projects
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200 border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Issues
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-primary/10">
          <CardHeader>
            <CardTitle>Usage Activity</CardTitle>
             <CardDescription>
                Analyses performed over the last 7 days.
              </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <UsageChart />
          </CardContent>
        </Card>
        <Card className="col-span-3 border-primary/10">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              You made 3 analyses this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Recent Sales/Projects List */}
            <div className="space-y-4">
                 {[1,2,3].map((i) => (
                     <div key={i} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">example-project-{i}.com</p>
                          <p className="text-sm text-muted-foreground">
                            Analyzed 2 hours ago
                          </p>
                        </div>
                        <div className="ml-auto font-medium text-primary">Score: 8{i}</div>
                      </div>
                 ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
