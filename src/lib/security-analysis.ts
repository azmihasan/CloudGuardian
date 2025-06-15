import { Project, Change } from '@/types';

export interface VulnerabilityReport {
  service: string;
  image: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
  lastUpdated: string;
}

export interface VulnerabilitySummary {
  totalCritical: number;
  totalHigh: number;
  totalMedium: number;
  totalLow: number;
  totalUnknown: number;
  bySourceType: {
    os: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      unknown: number;
    };
    app: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      unknown: number;
    };
  };
}

export function analyzeVulnerabilities(reports: VulnerabilityReport[]): VulnerabilitySummary {
  const summary: VulnerabilitySummary = {
    totalCritical: 0,
    totalHigh: 0,
    totalMedium: 0,
    totalLow: 0,
    totalUnknown: 0,
    bySourceType: {
      os: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0
      },
      app: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0
      }
    }
  };

  reports.forEach(report => {
    // Update total counts
    summary.totalCritical += report.critical;
    summary.totalHigh += report.high;
    summary.totalMedium += report.medium;
    summary.totalLow += report.low;
    summary.totalUnknown += report.unknown;

    // Determine if it's an OS or app vulnerability based on the image name
    const isOSVulnerability = report.image.includes('debian') || report.image.includes('ubuntu');
    const target = isOSVulnerability ? summary.bySourceType.os : summary.bySourceType.app;

    // Update source type specific counts
    target.critical += report.critical;
    target.high += report.high;
    target.medium += report.medium;
    target.low += report.low;
    target.unknown += report.unknown;
  });

  return summary;
}

export function convertToSecurityChanges(reports: VulnerabilityReport[]): Change[] {
  const changes: Change[] = [];

  reports.forEach(report => {
    if (report.critical > 0) {
      changes.push({
        id: `critical-${report.service}`,
        title: `Critical vulnerabilities in ${report.service}`,
        description: `Found ${report.critical} critical vulnerabilities in ${report.image}`,
        severity: 'High',
        timestamp: report.lastUpdated,
        details: `Service: ${report.service}\nImage: ${report.image}\nLast Updated: ${report.lastUpdated}`,
        links: [{
          title: 'View Details',
          url: `/security/${report.service}`
        }]
      });
    }

    if (report.high > 0) {
      changes.push({
        id: `high-${report.service}`,
        title: `High severity vulnerabilities in ${report.service}`,
        description: `Found ${report.high} high severity vulnerabilities in ${report.image}`,
        severity: 'High',
        timestamp: report.lastUpdated,
        details: `Service: ${report.service}\nImage: ${report.image}\nLast Updated: ${report.lastUpdated}`,
        links: [{
          title: 'View Details',
          url: `/security/${report.service}`
        }]
      });
    }
  });

  return changes;
}

export function getSecurityScore(reports: VulnerabilityReport[]): number {
  const weights = {
    critical: 1.0,
    high: 0.7,
    medium: 0.4,
    low: 0.1,
    unknown: 0.2
  };

  let totalWeight = 0;
  let maxPossibleWeight = 0;

  reports.forEach(report => {
    totalWeight += (
      report.critical * weights.critical +
      report.high * weights.high +
      report.medium * weights.medium +
      report.low * weights.low +
      report.unknown * weights.unknown
    );

    maxPossibleWeight += (
      (report.critical + report.high + report.medium + report.low + report.unknown) * weights.critical
    );
  });

  if (maxPossibleWeight === 0) return 100;
  
  const score = 100 - (totalWeight / maxPossibleWeight) * 100;
  return Math.max(0, Math.min(100, score));
} 