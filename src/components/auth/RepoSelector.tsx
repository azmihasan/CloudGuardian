// components/auth/RepoSelector.tsx
import React, { useState, useEffect } from "react";
import { GitHubIcon } from "../Icons";

type Repository = {
	id: number;
	name: string;
	full_name: string;
	description: string;
	html_url: string;
	private: boolean;
	selected?: boolean;
};

export default function RepoSelector() {
	const [repos, setRepos] = useState<Repository[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// In a real app, we would fetch repositories from GitHub API
	useEffect(() => {
		// Simulate API call
		setTimeout(() => {
			// Mock repositories data
			const mockRepos: Repository[] = [
				{
					id: 1,
					name: "ryon",
					full_name: "felixp33/ryon",
					description: "A web application built with Next.js",
					html_url: "https://github.com/felixp33/ryon",
					private: false,
					selected: true,
				},
				{
					id: 2,
					name: "findmyklez",
					full_name: "felixp33/findmyklez",
					description: "Location-based discovery app",
					html_url: "https://github.com/felixp33/findmyklez",
					private: false,
				},
				{
					id: 3,
					name: "flatswaps",
					full_name: "felixp33/flatmatch",
					description: "Property rental and exchange platform",
					html_url: "https://github.com/felixp33/flatmatch",
					private: true,
				},
				{
					id: 4,
					name: "personal-blog",
					full_name: "felixp33/personal-blog",
					description: "My personal blog built with Gatsby",
					html_url: "https://github.com/felixp33/personal-blog",
					private: false,
				},
			];

			setRepos(mockRepos);
			setLoading(false);
		}, 1000);
	}, []);

	const toggleRepo = (id: number) => {
		setRepos(repos.map((repo) => (repo.id === id ? { ...repo, selected: !repo.selected } : repo)));
	};

	const handleSubmit = () => {
		const selectedRepos = repos.filter((repo) => repo.selected);
		console.log("Selected repositories:", selectedRepos);
		// In a real app, we would send this to the backend
		window.location.href = "/";
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<div className="text-red-500 mb-4">Error loading repositories: {error}</div>
				<button
					onClick={() => window.location.reload()}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-gray-700 dark:text-gray-300">
				<p className="mb-4">
					Select the repositories you want CloudGuardian to monitor. We'll analyze them for security
					vulnerabilities and improvement opportunities.
				</p>
				<p className="text-sm bg-blue-50 dark:bg-blue-900 p-4 rounded-md border border-blue-200 dark:border-blue-800">
					<strong>Note:</strong> CloudGuardian needs read access to your repository code to analyze it effectively.
					We never store your code and all analysis is done securely.
				</p>
			</div>

			<div className="space-y-4 mt-6">
				{repos.map((repo) => (
					<div
						key={repo.id}
						className={`border rounded-md p-4 ${
							repo.selected
								? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
								: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
						}`}
					>
						<div className="flex items-start">
							<div className="flex-shrink-0 pt-0.5">
								<input
									type="checkbox"
									checked={repo.selected || false}
									onChange={() => toggleRepo(repo.id)}
									className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
								/>
							</div>
							<div className="ml-3 flex-1">
								<div className="flex items-center">
									<h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{repo.name}</h3>
									{repo.private && (
										<span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
											Private
										</span>
									)}
								</div>
								<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{repo.description}</p>
								<a
									href={repo.html_url}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-2 inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
								>
									<GitHubIcon className="h-3 w-3 mr-1" />
									{repo.full_name}
								</a>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="flex justify-end mt-6 space-x-3">
				<button
					onClick={() => (window.location.href = "/")}
					className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
				>
					Cancel
				</button>
				<button
					onClick={handleSubmit}
					disabled={!repos.some((repo) => repo.selected)}
					className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
						repos.some((repo) => repo.selected)
							? "bg-blue-600 hover:bg-blue-700"
							: "bg-blue-400 cursor-not-allowed"
					}`}
				>
					Continue
				</button>
			</div>
		</div>
	);
}
