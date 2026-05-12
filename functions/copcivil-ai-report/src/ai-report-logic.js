/**
 * Aggregate incident data into statistics for AI analysis.
 * @param {Array<object>} incidents
 * @returns {object}
 */
export function aggregateIncidents(incidents) {
  if (incidents.length === 0) {
    return {
      totalIncidents: 0,
      byCategory: {},
      bySeverity: {},
      byAction: {},
      topIps: [],
      topUrls: [],
      avgThreatScore: 0,
    };
  }

  const byCategory = {};
  const bySeverity = {};
  const byAction = {};
  const ipCounts = {};
  const urlCounts = {};
  let totalScore = 0;

  for (const inc of incidents) {
    byCategory[inc.attack_category] = (byCategory[inc.attack_category] || 0) + 1;
    bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
    byAction[inc.action_taken] = (byAction[inc.action_taken] || 0) + 1;
    ipCounts[inc.ip_address] = (ipCounts[inc.ip_address] || 0) + 1;
    urlCounts[inc.request_url] = (urlCounts[inc.request_url] || 0) + 1;
    totalScore += inc.threat_score || 0;
  }

  const topIps = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topUrls = Object.entries(urlCounts)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalIncidents: incidents.length,
    byCategory,
    bySeverity,
    byAction,
    topIps,
    topUrls,
    avgThreatScore: Math.round(totalScore / incidents.length),
  };
}

/**
 * Build the user prompt for the LLM with aggregated incident data.
 * @param {object} stats
 * @param {{start: string, end: string}} period
 * @returns {string}
 */
export function buildAnalyticsPrompt(stats, period) {
  return `Analyze the following web security incident data for the period ${period.start} to ${period.end}.

## Incident Summary
- **Total Incidents:** ${stats.totalIncidents}
- **Average Threat Score:** ${stats.avgThreatScore}

## Breakdown by Attack Category
${Object.entries(stats.byCategory).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

## Breakdown by Severity
${Object.entries(stats.bySeverity).map(([sev, count]) => `- ${sev}: ${count}`).join('\n')}

## Breakdown by Action Taken
${Object.entries(stats.byAction).map(([action, count]) => `- ${action}: ${count}`).join('\n')}

## Top Attacking IPs
${stats.topIps.map((item, i) => `${i + 1}. ${item.ip} (${item.count} incidents)`).join('\n')}

## Top Targeted Endpoints
${stats.topUrls.map((item, i) => `${i + 1}. ${item.url} (${item.count} hits)`).join('\n')}

Please provide:
1. **Executive Summary** — A concise overview of the security posture during this period.
2. **Threat Analysis** — Detailed analysis of attack patterns, trends, and attacker behavior.
3. **Risk Assessment** — Current risk level (Critical/High/Medium/Low) with justification.
4. **Recommendations** — Specific, actionable security recommendations based on the data.
5. **Trend Comparison** — Note any concerning patterns or escalations.`;
}

/**
 * System prompt for the security analyst LLM.
 */
export const SECURITY_ANALYST_SYSTEM_PROMPT = `You are an expert cybersecurity analyst specializing in web application security. You analyze security incident data and produce clear, actionable reports.

Your reports should be:
- Professional and suitable for both technical and non-technical stakeholders
- Data-driven — reference specific numbers from the provided data
- Actionable — every recommendation should be specific and implementable
- Risk-aware — clearly communicate the severity of findings

Format your response in clean Markdown with proper headings and sections.`;
