// lib/utils.ts
import { Project, Change } from "@/types";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Formats a date for display
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return "Today";
	} else if (diffDays === 1) {
		return "Yesterday";
	} else if (diffDays < 7) {
		return `${diffDays}d ago`;
	} else if (diffDays < 30) {
		return `${Math.floor(diffDays / 7)}w ago`;
	} else if (diffDays < 365) {
		return `${Math.floor(diffDays / 30)}mo ago`;
	} else {
		return `${Math.floor(diffDays / 365)}y ago`;
	}
}

/**
 * Gets the total number of issues for a project
 * @param project Project object
 * @returns Total number of issues
 */
export function getTotalIssues(project: Project): number {
	return (
		project.automaticChanges.length + project.securityRecommendations.length + project.improvementSuggestions.length
	);
}

/**
 * Gets the appropriate status color based on project issues
 * @param project Project object
 * @returns CSS color class
 */
export function getProjectStatusColor(project: Project): string {
	if (project.securityRecommendations.length > 0) {
		return "text-red-500";
	} else if (project.automaticChanges.length > 0) {
		return "text-yellow-500";
	} else {
		return "text-green-500";
	}
}

/**
 * Creates a chart data object for visualization
 * @param data Array of numbers
 * @param label Chart label
 * @param color Line color
 * @returns Chart data object
 */
export function createChartData(data: number[], label: string, color: string) {
	return {
		labels: Array(data.length).fill(""),
		datasets: [
			{
				label,
				data,
				borderColor: color,
				backgroundColor: `${color}20`, // 20% opacity
				tension: 0.3,
				fill: true,
			},
		],
	};
}

/**
 * Truncates text to a specific length
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, length: number = 100): string {
	if (text.length <= length) return text;
	return text.substring(0, length).trim() + "...";
}

/**
 * Sorts changes by timestamp, with most recent first
 * @param changes Array of changes
 * @returns Sorted array
 */
export function sortChangesByDate(changes: Change[]): Change[] {
	return [...changes].sort((a, b) => {
		const dateA = new Date(a.timestamp);
		const dateB = new Date(b.timestamp);
		return dateB.getTime() - dateA.getTime();
	});
}

/**
 * Filters changes by severity
 * @param changes Array of changes
 * @param severity Severity to filter by
 * @returns Filtered array
 */
export function filterBySeverity(changes: Change[], severity?: "High" | "Medium" | "Low"): Change[] {
	if (!severity) return changes;
	return changes.filter((change) => change.severity === severity);
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
