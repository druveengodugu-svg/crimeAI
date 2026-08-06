import React from 'react';
import { Download, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Car, Crosshair, MapPin } from 'lucide-react';
import { InvestigationReport } from '../../types';
import html2pdf from 'html2pdf.js';

interface ReportViewProps {
  report: InvestigationReport;
}

export const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  const handleDownloadPDF = () => {
    const element = document.getElementById('investigation-report-pdf');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `CrimeLens_Report_${report.case_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            Official AI Investigation Dossier
          </h3>
          <p className="text-xs text-slate-400 font-mono">Case #{report.case_number}</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md shadow-cyan-500/20 transition-all hover:scale-105"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* PDF Printable Area */}
      <div id="investigation-report-pdf" className="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-8 text-slate-200">
        {/* Dossier Letterhead */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-lg">
              <ShieldAlert className="h-6 w-6" />
              <span>CRIMELENS AI – FORENSIC DOSSIER</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1">{report.case_title}</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Reference ID: {report.case_number}</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold px-3 py-1 rounded-full">
              {report.overall_confidence}% Case Confidence Score
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">1. Executive Summary</h2>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {report.executive_summary}
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">2. Multimodal Evidence Synthesis</h2>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {report.evidence_summary}
          </div>
        </div>

        {/* Entities Extracted Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suspects */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-cyan-400" /> Suspects Identified ({report.suspects_json?.length || 0})
            </h3>
            <div className="space-y-2">
              {report.suspects_json?.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-slate-400">{s.description}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Source: {s.source}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicles */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Car className="h-4 w-4 text-emerald-400" /> Vehicles Identified ({report.vehicles_json?.length || 0})
            </h3>
            <div className="space-y-2">
              {report.vehicles_json?.map((v, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-emerald-400">{v.make}</div>
                  <div className="text-slate-300 font-mono text-[11px]">Plate: {v.plate}</div>
                  <div className="text-[11px] text-slate-400">{v.relevance}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weapons & Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weapons */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Crosshair className="h-4 w-4 text-red-400" /> Weapons & Ballistics ({report.weapons_json?.length || 0})
            </h3>
            <div className="space-y-2">
              {report.weapons_json?.map((w, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-red-400">{w.type}</div>
                  <div className="text-slate-400">{w.evidence}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-purple-400" /> Key Locations ({report.locations_json?.length || 0})
            </h3>
            <div className="space-y-2">
              {report.locations_json?.map((l, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-purple-400">{l.location}</div>
                  <div className="text-slate-400">{l.address}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contradictions */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> 3. Verified Contradictions ({report.contradictions_json?.length || 0})
          </h2>
          <div className="space-y-3">
            {report.contradictions_json?.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs space-y-1.5">
                <div className="font-bold text-red-400">{c.category} ({c.confidence_score}% confidence)</div>
                <div className="text-slate-300">"{c.statement1}" (Source: {c.source1}) vs "{c.statement2}" (Source: {c.source2})</div>
                <div className="text-slate-400 italic">↳ {c.explanation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Leads & Recommended Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">4. Recommended Leads</h2>
            <ul className="space-y-2">
              {report.leads_json?.map((lead, i) => (
                <li key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <ArrowRight className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{lead}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">5. Recommended Next Steps</h2>
            <ul className="space-y-2">
              {report.next_steps_json?.map((step, i) => (
                <li key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Signoff */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          CONFIDENTIAL LAW ENFORCEMENT DOSSIER • GENERATED BY CRIMELENS AI MULTIMODAL SYSTEM
        </div>
      </div>
    </div>
  );
};
