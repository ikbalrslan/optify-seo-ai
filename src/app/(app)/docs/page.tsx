"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, Globe, Key, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Documentation</h1>
                <p className="text-slate-500">Everything you need to know about integrating and using Optify.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            WordPress Integration Guide
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-slate-600">
                            Connect your WordPress site to Optify to publish SEO-optimized articles directly from the dashboard.
                            Follow these simple steps to get started.
                        </p>

                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">

                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">1</span>
                                        Download & Install Plugin
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-11 pr-4 pb-4 space-y-3 text-slate-600">
                                    <p>First, you need to install the Optify Connector plugin on your WordPress site.</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li>Go to the <strong>Settings</strong> page in Optify and switch to the <strong>Integrations</strong> tab.</li>
                                        <li>Click the <span className="inline-flex items-center gap-1 text-blue-600 font-medium"><Download className="h-3 w-3" /> Download Plugin</span> link to get the <code>optify-connector.zip</code> file.</li>
                                        <li>Log in to your <strong>WordPress Admin Dashboard</strong>.</li>
                                        <li>Navigate to <strong>Plugins &gt; Add New</strong>.</li>
                                        <li>Click the <strong>Upload Plugin</strong> button at the top.</li>
                                        <li>Choose the downloaded zip file and click <strong>Install Now</strong>.</li>
                                        <li>Once installed, click <strong>Activate Plugin</strong>.</li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">2</span>
                                        Generate Application Password
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-11 pr-4 pb-4 space-y-3 text-slate-600">
                                    <p>WordPress Application Passwords allow Optify to securely connect without using your main password.</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li>In your WordPress Admin, go to <strong>Users &gt; Profile</strong>.</li>
                                        <li>Scroll down to the <strong>Application Passwords</strong> section.</li>
                                        <li>In the "New Application Password Name" field, enter a name like <code>Optify</code>.</li>
                                        <li>Click <strong>Add New Application Password</strong>.</li>
                                        <li>
                                            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                                                    <Key className="h-4 w-4" /> Important
                                                </p>
                                                <p className="text-sm">Copy the generated password instantly! It will look like <code>abcd 1234 efgh 5678</code>. You won't be able to see it again.</p>
                                            </div>
                                        </li>
                                    </ol>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">3</span>
                                        Connect to Optify
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-11 pr-4 pb-4 space-y-3 text-slate-600">
                                    <p>Now, link your site using the credentials you just generated.</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li>Return to the Optify <strong>Settings &gt; Integrations</strong> page.</li>
                                        <li>Click <strong>Connect New Site</strong>.</li>
                                        <li>Enter your <strong>Site URL</strong> (e.g., <code>https://yourwebsite.com</code>).</li>
                                        <li>Enter your WordPress <strong>Username</strong> (the one you used to generate the password).</li>
                                        <li>Paste the <strong>Application Password</strong> you copied earlier.</li>
                                        <li>Click <strong>Connect</strong>.</li>
                                    </ol>
                                    <div className="flex items-center gap-2 text-green-600 mt-2 font-medium">
                                        <CheckCircle2 className="h-4 w-4" />
                                        You're all set!
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-medium">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">4</span>
                                        How to Publish
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-11 pr-4 pb-4 space-y-3 text-slate-600">
                                    <p>Publishing articles is now one click away.</p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>Go to the <strong>Blog Generator</strong>.</li>
                                        <li>Create your content as usual.</li>
                                        <li>In the output panel, click the <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">Publish</span> button.</li>
                                        <li>Select your connected site from the dropdown.</li>
                                        <li>Choose whether to save as a <strong>Draft</strong> or <strong>Publish Immediately</strong>.</li>
                                        <li>Click <strong>Publish Now</strong>.</li>
                                    </ul>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Note: Links and Meta descriptions will also be synchronized with supported SEO plugins (Yoast, RankMath) if installed.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
