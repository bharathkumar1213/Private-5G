import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { AlertsPage } from './pages/AlertsPage';
import { SelfHealingPage } from './pages/SelfHealingPage';
import { AutomationPage } from './pages/AutomationPage';
import { SystemDiagnosticsPage } from './pages/SystemDiagnosticsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsConditionsPage } from './pages/TermsConditionsPage';

export default function App() {
  const [overviewData, setOverviewData] = useState(null);
  const [liveMetricsData, setLiveMetricsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [selfHealingData, setSelfHealingData] = useState(null);
  const [jenkinsData, setJenkinsData] = useState(null);
  const [systemData, setSystemData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Poll function to fetch all telemetry
  const fetchAllData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);

    try {
      const [
        overviewRes,
        liveMetricsRes,
        alertsRes,
        selfHealingRes,
        jenkinsRes,
        systemRes,
      ] = await Promise.allSettled([
        api.getOverview(),
        api.getLiveMetrics(),
        api.getAlerts(),
        api.getSelfHealing(),
        api.getJenkins(),
        api.getSystemDiagnostics(),
      ]);

      if (overviewRes.status === 'fulfilled') {
        setOverviewData(overviewRes.value);
        setError(null);
      } else {
        setError(overviewRes.reason?.message || 'Failed to connect to backend proxy');
      }

      if (liveMetricsRes.status === 'fulfilled') setLiveMetricsData(liveMetricsRes.value);
      if (alertsRes.status === 'fulfilled') setAlertsData(alertsRes.value);
      if (selfHealingRes.status === 'fulfilled') setSelfHealingData(selfHealingRes.value);
      if (jenkinsRes.status === 'fulfilled') setJenkinsData(jenkinsRes.value);
      if (systemRes.status === 'fulfilled') setSystemData(systemRes.value);
    } catch (err) {
      console.error('[Telemetry Poll Error]', err);
      setError(err.message);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  }, []);

  // Set up 5-second polling interval
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  const activeAlertCount = alertsData?.stats?.totalActive || 0;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F1F4F7] dark:bg-[#101827] text-[#17213B] dark:text-[#F8FAFC] flex font-sans transition-colors duration-200">
        {/* Left Navigation Sidebar */}
        <Sidebar
          overviewData={overviewData}
          activeAlertCount={activeAlertCount}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Layout (Offset on Desktop by Sidebar Width) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Top Bar Header */}
          <Header
            overviewData={overviewData}
            onManualRefresh={() => fetchAllData(true)}
            isRefreshing={isRefreshing}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Page Body Viewport */}
          <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    overviewData={overviewData}
                    liveMetricsData={liveMetricsData}
                    alertsData={alertsData}
                    selfHealingData={selfHealingData}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route
                path="/metrics"
                element={
                  <LiveMonitoringPage
                    liveMetricsData={liveMetricsData}
                    loading={loading}
                  />
                }
              />
              <Route
                path="/alerts"
                element={
                  <AlertsPage
                    alertsData={alertsData}
                    loading={loading}
                    error={error}
                  />
                }
              />
              <Route
                path="/self-healing"
                element={
                  <SelfHealingPage
                    selfHealingData={selfHealingData}
                    loading={loading}
                  />
                }
              />
              <Route
                path="/automation"
                element={
                  <AutomationPage
                    jenkinsData={jenkinsData}
                    loading={loading}
                  />
                }
              />
              <Route
                path="/system"
                element={
                  <SystemDiagnosticsPage
                    systemData={systemData}
                    loading={loading}
                  />
                }
              />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-conditions" element={<TermsConditionsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
