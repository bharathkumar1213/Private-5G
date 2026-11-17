import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Terminal, Radio } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#162036] border-t border-[#E9EDF2] dark:border-[#2B3B57] py-5 px-4 lg:px-8 text-xs font-sans text-[#8995A8] dark:text-[#AEB8C8] transition-colors duration-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-2 h-2 rounded-full bg-[#059669]" />
          <span className="font-semibold text-[#17213B] dark:text-[#F8FAFC]">
            DevOps Based Monitoring and Self-Healing for Private 5G Network
          </span>
          <span className="text-[#D8DEE7] dark:text-[#2B3B57] hidden sm:inline">•</span>
          <span className="text-[11px] text-[#8995A8] dark:text-[#AEB8C8] hidden sm:inline">
            Standalone 3GPP Rel-16 Capstone
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[#8995A8] dark:text-[#AEB8C8] text-xs">
          <Link
            to="/privacy-policy"
            className="hover:text-[#F59E0B] transition-colors flex items-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-[#8995A8] dark:text-[#AEB8C8]" />
            <span>Privacy Policy</span>
          </Link>
          <span className="text-[#D8DEE7] dark:text-[#2B3B57]">•</span>
          <Link
            to="/terms-conditions"
            className="hover:text-[#F59E0B] transition-colors flex items-center space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#8995A8] dark:text-[#AEB8C8]" />
            <span>Terms of Use</span>
          </Link>
          <span className="text-[#D8DEE7] dark:text-[#2B3B57]">•</span>
          <Link
            to="/system"
            className="hover:text-[#F59E0B] transition-colors flex items-center space-x-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-[#8995A8] dark:text-[#AEB8C8]" />
            <span>Diagnostics</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
