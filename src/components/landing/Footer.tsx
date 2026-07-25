import { Sparkles } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#FAF6EF] border-t border-[#E7DFCF] py-12 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-[#009E8A] p-1 rounded-md">
                                <Sparkles className="w-4 h-4 text-white" strokeWidth={1.75} />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-[#1C1815]">Optify</span>
                        </div>
                        <p className="text-[#6F675A] text-sm max-w-xs leading-relaxed">
                            The all-in-one SEO platform for modern growth teams.
                            Audit, analyze, and optimize your organic search performance.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#1C1815] mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-[#6F675A]">
                            <li><a href="#pricing" className="hover:text-[#009E8A]">Pricing</a></li>
                            <li><a href="#" className="hover:text-[#009E8A]">Changelog</a></li>
                            <li><a href="#" className="hover:text-[#009E8A]">Docs</a></li>
                            <li><a href="/signin" className="hover:text-[#009E8A]">Log in</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#1C1815] mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-[#6F675A]">
                            <li><a href="#" className="hover:text-[#009E8A]">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[#009E8A]">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[#009E8A]">DPA</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-[#1C1815] mb-4">Social</h4>
                        <ul className="space-y-3 text-sm text-[#6F675A]">
                            <li><a href="#" className="hover:text-[#009E8A]">Twitter</a></li>
                            <li><a href="#" className="hover:text-[#009E8A]">GitHub</a></li>
                            <li><a href="#" className="hover:text-[#009E8A]">Discord</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-[#E7DFCF] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#9B927F] text-sm">
                        © {new Date().getFullYear()} Optify. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {/* Social Icons Placeholder */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
