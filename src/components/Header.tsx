"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
	const pathname = usePathname();

	const getLinkClassName = (path: string) => {
		const isActive = pathname === path;
		return isActive
			? "border-blue-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
			: "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
	};

	return (
		<header className="bg-white dark:bg-gray-800 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<div className="h-8 w-8 rounded-full bg-blue-600 mr-3"></div>
							<Link href="/" className="font-bold text-xl text-gray-900 dark:text-white">
								CloudGuardian
							</Link>
						</div>
						<nav className="flex sm:ml-6 sm:space-x-8" aria-label="Global">
							<Link href="/" className={getLinkClassName("/")}>
								Projects
							</Link>
							<Link href="/reports" className={getLinkClassName("/reports")}>
								Reports
							</Link>
							<Link href="/settings" className={getLinkClassName("/settings")}>
								Settings
							</Link>
						</nav>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						<button className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<span className="sr-only">View notifications</span>
							<svg
								className="h-6 w-6"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
								/>
							</svg>
						</button>

						<div className="ml-3 relative">
							<div>
								<button className="bg-white dark:bg-gray-800 rounded-full flex items-center">
									<span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
										FP
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
