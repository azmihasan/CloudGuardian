// components/auth/GitHubLogin.tsx
import React from "react";
import { GitHubIcon } from "../Icons";
import Cookies from 'js-cookie';

export default function GitHubLogin() {
	// In a real application, this would redirect to the GitHub OAuth flow
	const handleLogin = () => {
		// Redirect to GitHub OAuth endpoint
		// window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_REDIRECT_URI)}&scope=repo,read:user,user:email`;

		// For demo purposes, we'll just simulate a successful login
		console.log("Redirecting to GitHub OAuth...");
		// Mock redirect to callback page after small delay
		setTimeout(() => {
			// Set a mock auth token
			Cookies.set('auth_token', 'mock_token', { expires: 7 }); // Expires in 7 days
			window.location.href = "/auth/callback?code=mock_code";
		}, 1000);
	};

	return (
		<button
			onClick={handleLogin}
			className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
		>
			<GitHubIcon className="h-5 w-5 mr-2" />
			Continue with GitHub
		</button>
	);
}
