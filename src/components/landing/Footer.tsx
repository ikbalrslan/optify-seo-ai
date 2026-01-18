import { BarChart } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-[#1DB954] p-1 rounded-md">
                                <BarChart className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Optify</span>
                        </div>
                        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                            The all-in-one SEO platform for modern growth teams.
                            Audit, analyze, and optimize your organic search performance.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#pricing" className="hover:text-black">Pricing</a></li>
                            <li><a href="#" className="hover:text-black">Changelog</a></li>
                            <li><a href="#" className="hover:text-black">Docs</a></li>
                            <li><a href="/signin" className="hover:text-black">Log in</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-black">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-black">DPA</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Social</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-black">Twitter</a></li>
                            <li><a href="#" className="hover:text-black">GitHub</a></li>
                            <li><a href="#" className="hover:text-black">Discord</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
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
