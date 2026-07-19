import { SignInButton } from "@/components/auth/SignInButton"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Optify</h1>
                <p className="text-sm text-gray-500 mb-8">Sign in to access your SEO dashboard</p>
                <SignInButton />
            </div>
        </div>
    )
}
