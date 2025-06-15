import React from 'react';
import { VulnerabilityReport, VulnerabilitySummary, analyzeVulnerabilities } from '@/lib/security-analysis';

interface SecurityDashboardProps {
  reports: VulnerabilityReport[];
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ reports }) => {
  const summary = analyzeVulnerabilities(reports);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Security Overview</h2>
      
      {/* Total Vulnerabilities */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-red-900/50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-red-400">{summary.totalCritical}</div>
          <div className="text-sm text-gray-300">Critical</div>
        </div>
        <div className="bg-orange-900/50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-orange-400">{summary.totalHigh}</div>
          <div className="text-sm text-gray-300">High</div>
        </div>
        <div className="bg-yellow-900/50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-yellow-400">{summary.totalMedium}</div>
          <div className="text-sm text-gray-300">Medium</div>
        </div>
        <div className="bg-blue-900/50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-400">{summary.totalLow}</div>
          <div className="text-sm text-gray-300">Low</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-gray-400">{summary.totalUnknown}</div>
          <div className="text-sm text-gray-300">Unknown</div>
        </div>
      </div>

      {/* Source Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OS Vulnerabilities */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">OS Vulnerabilities</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Critical</span>
              <span className="text-red-400">{summary.bySourceType.os.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">High</span>
              <span className="text-orange-400">{summary.bySourceType.os.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Medium</span>
              <span className="text-yellow-400">{summary.bySourceType.os.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Low</span>
              <span className="text-blue-400">{summary.bySourceType.os.low}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Unknown</span>
              <span className="text-gray-400">{summary.bySourceType.os.unknown}</span>
            </div>
          </div>
        </div>

        {/* Application Vulnerabilities */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Application Vulnerabilities</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Critical</span>
              <span className="text-red-400">{summary.bySourceType.app.critical}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">High</span>
              <span className="text-orange-400">{summary.bySourceType.app.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Medium</span>
              <span className="text-yellow-400">{summary.bySourceType.app.medium}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Low</span>
              <span className="text-blue-400">{summary.bySourceType.app.low}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Unknown</span>
              <span className="text-gray-400">{summary.bySourceType.app.unknown}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Vulnerable Services</h3>
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Critical</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">High</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Medium</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Low</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {reports.map((report) => (
                <tr key={report.service} className="hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.image}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{report.critical}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400">{report.high}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">{report.medium}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">{report.low}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard; 