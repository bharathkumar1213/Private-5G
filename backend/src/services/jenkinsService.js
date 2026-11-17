import axios from 'axios';
import { config } from '../config.js';

export const jenkinsService = {
  /**
   * Get Jenkins automation status safely without exposing credentials
   */
  async getStatus() {
    // If Jenkins URL is not configured, strictly return "Integration pending"
    if (!config.jenkins.url) {
      return {
        available: false,
        status: 'Integration pending',
        reason: 'Jenkins automation endpoint not configured in backend environment',
        jobName: config.jenkins.jobName || 'Unavailable',
        lastBuild: null,
      };
    }

    try {
      const authHeader = (config.jenkins.user && config.jenkins.token)
        ? {
            Authorization: `Basic ${Buffer.from(`${config.jenkins.user}:${config.jenkins.token}`).toString('base64')}`,
          }
        : {};

      const response = await axios.get(
        `${config.jenkins.url}/job/${encodeURIComponent(config.jenkins.jobName)}/api/json`,
        {
          timeout: config.timeoutMs,
          headers: {
            Accept: 'application/json',
            ...authHeader,
          },
        }
      );

      const jobData = response.data;
      const lastBuild = jobData.lastBuild
        ? {
            number: jobData.lastBuild.number,
            url: jobData.lastBuild.url ? jobData.lastBuild.url.replace(/\/\/.*@/, '//') : null, // sanitize credentials in URL
          }
        : null;

      let buildDetails = null;
      if (lastBuild?.number) {
        try {
          const buildResp = await axios.get(
            `${config.jenkins.url}/job/${encodeURIComponent(config.jenkins.jobName)}/${lastBuild.number}/api/json`,
            {
              timeout: config.timeoutMs,
              headers: { Accept: 'application/json', ...authHeader },
            }
          );
          buildDetails = {
            result: buildResp.data.result || 'BUILDING',
            timestamp: buildResp.data.timestamp ? new Date(buildResp.data.timestamp).toISOString() : null,
            durationMs: buildResp.data.duration,
            building: buildResp.data.building || false,
          };
        } catch {
          // Keep buildDetails null if individual build fetch fails
        }
      }

      return {
        available: true,
        status: buildDetails ? buildDetails.result : 'CONFIGURED',
        jobName: config.jenkins.jobName,
        displayName: jobData.displayName || config.jenkins.jobName,
        buildable: jobData.buildable ?? false,
        lastBuildNumber: lastBuild?.number ?? null,
        lastBuildDetails: buildDetails,
        lastChecked: new Date().toISOString(),
      };
    } catch (err) {
      return {
        available: false,
        status: 'Integration pending',
        reason: `Jenkins unreachable: ${err.message}`,
        jobName: config.jenkins.jobName,
        lastBuild: null,
      };
    }
  },
};

