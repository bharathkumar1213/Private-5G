import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  prometheusUrl: (process.env.PROMETHEUS_URL || 'http://172.17.0.1:19091').replace(/\/+$/, ''),
  alertmanagerUrl: (process.env.ALERTMANAGER_URL || 'http://172.17.0.1:19093').replace(/\/+$/, ''),
  timeoutMs: parseInt(process.env.METRICS_TIMEOUT_MS || '4000', 10),
  jenkins: {
    url: process.env.JENKINS_URL ? process.env.JENKINS_URL.replace(/\/+$/, '') : '',
    user: process.env.JENKINS_USER || '',
    token: process.env.JENKINS_API_TOKEN || '',
    jobName: process.env.JENKINS_JOB_NAME || '5g-core-recovery',
  },
  recovery: {
    apiUrl: process.env.RECOVERY_API_URL ? process.env.RECOVERY_API_URL.replace(/\/+$/, '') : '',
    bridgeUrl: process.env.RECOVERY_BRIDGE_URL ? process.env.RECOVERY_BRIDGE_URL.replace(/\/+$/, '') : '',
    token: process.env.RECOVERY_API_TOKEN || '',
  }
};
