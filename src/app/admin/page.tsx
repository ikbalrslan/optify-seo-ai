import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Activity, DollarSign } from "lucide-react";


export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">

            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">$12,345.00</div>
                        <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-violet-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">+235</div>
                        <p className="text-xs text-muted-foreground">+20% new users</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-green-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">1,543</div>
                        <p className="text-xs text-muted-foreground">+180 this week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-lime-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Churn Rate</CardTitle>
                        <Activity className="h-4 w-4 text-lime-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">2.4%</div>
                        <p className="text-xs text-muted-foreground">-0.5% lower</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">OM</div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$19.00</div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">JL</div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Jackson Lee</p>
                                    <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$39.00</div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">IN</div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Isabella Nguyen</p>
                                    <p className="text-sm text-muted-foreground">isabella.nguyen@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$299.00</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
