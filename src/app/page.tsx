"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import Navbar from "@/components/layout/Navbar";
import { Project } from '@/types/project';

export default function Dashboard() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await fetch('/api/projects');
				if (!response.ok) {
					throw new Error('Failed to fetch projects');
				}
				const data = await response.json();
				setProjects(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 text-white">
				<Navbar />
				<div className="p-8 pt-24">Loading projects...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-900 text-white">
				<Navbar />
				<div className="p-8 pt-24 text-red-500">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<Navbar />
			<div className="p-8 pt-24">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold">Projects</h1>
					<div className="flex flex-col gap-2">
						<Link href="/projects/new">
							<Button className="flex items-center gap-2">
								<Plus className="h-4 w-4" />
								Add New Repository
							</Button>
						</Link>
						<Link href="/discover">
							<Button className="flex items-center gap-2" variant="secondary">
								<img src="/docker-icon.svg" alt="Docker Icon" className="h-4 w-4" />
								Discover Projects
							</Button>
						</Link>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<Link href={`/projects/${project.id}`} key={project.id}>
							<Card className="hover:shadow-lg transition-shadow cursor-pointer">
								<CardHeader>
									<CardTitle className="flex items-center justify-between">
										<span>{project.name}</span>
										{project.vulnerabilities && (
											<div className="flex items-center gap-2">
												<Shield className="h-4 w-4" />
												<span className="text-sm">
													{Object.values(project.vulnerabilities).reduce((a, b) => a + b, 0)} issues
												</span>
											</div>
										)}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p className="text-sm text-gray-500">
											Last scan: {project.lastScan ? new Date(project.lastScan).toLocaleDateString() : 'Never'}
										</p>
										{project.vulnerabilities && (
											<div className="flex gap-2">
												{project.vulnerabilities.critical > 0 && (
													<span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
														{project.vulnerabilities.critical} Critical
													</span>
												)}
												{project.vulnerabilities.high > 0 && (
													<span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
														{project.vulnerabilities.high} High
													</span>
												)}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
