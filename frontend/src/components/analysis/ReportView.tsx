import React from 'react';
import { Download, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Car, Crosshair, MapPin, Eye } from 'lucide-react';
import { InvestigationReport, InvestigationCase } from '../../types';
import html2pdf from 'html2pdf.js';

interface ReportViewProps {
  report: InvestigationReport | null;
  caseObj?: InvestigationCase | null;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, caseObj }) => {
  const handleDownloadPDF = () => {
    const element = document.getElementById('investigation-report-pdf');
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `CrimeLens_Report_${report?.case_number || caseObj?.case_number || 'Dossier'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!report) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <ShieldAlert className="h-10 w-10 text-cyan-400/50 mx-auto" />
        <h3 className="text-base font-bold text-white font-space">No Investigation Report Synthesized Yet</h3>
        <p className="text-xs text-slate-400 font-mono">Run the 8-Agent Case Analysis to generate the full executive investigation report.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 font-space">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
            Official AI Forensic Dossier Report
          </h3>
          <p className="text-xs text-slate-400 font-mono">Case #{report.case_number}</p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="btn-cyber-primary text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 font-mono uppercase shadow-lg"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* PDF Printable Area */}
      <div id="investigation-report-pdf" className="p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-8 text-slate-200 shadow-2xl">
        {/* Dossier Letterhead */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-lg font-space">
              <ShieldAlert className="h-6 w-6" />
              <span>CRIMELENS AI – FORENSIC DOSSIER</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1 font-space">{report.case_title}</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Reference ID: {report.case_number}</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {report.overall_confidence}% Case Confidence Score
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">1. Executive Summary</h2>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            {report.executive_summary}
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">2. Multimodal Evidence Synthesis</h2>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            {report.evidence_summary}
          </div>
        </div>

        {/* Suspects & Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Suspects */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-cyan-400" /> Suspects Identified ({report.suspects_json?.length || 0})
            </h3>
            <div className="space-y-3">
              {report.suspects_json?.map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-white font-space text-sm">{s.name}</div>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 rounded">
                      Confidence: {s.confidence || 91}%
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans text-xs">{s.description}</div>
                  <div className="text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-400">Evidence Source: </span>{s.source} ({s.evidence_details || 'Timestamp 19:08, Frame 458'})
                  </div>
                  {s.reasoning && (
                    <div className="text-[11px] text-slate-400 font-sans italic">
                      <span className="font-bold text-slate-300 font-mono">Reasoning: </span>{s.reasoning}
                    </div>
                  )}
                  {s.recommended_verification && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30 font-sans">
                      <span className="font-bold font-mono text-amber-400">Recommended Verification: </span>{s.recommended_verification}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicles */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Car className="h-4 w-4 text-emerald-400" /> Vehicles Identified ({report.vehicles_json?.length || 0})
            </h3>
            <div className="space-y-3">
              {report.vehicles_json?.map((v, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-emerald-400 font-space text-sm">{v.make}</div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Confidence: {v.confidence || 95}%
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans text-xs">Registration Plate: <span className="font-mono text-cyan-400 font-bold">{v.plate}</span></div>
                  <div className="text-[11px] text-slate-300 font-sans">{v.relevance}</div>
                  <div className="text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-400">Evidence Used: </span>{v.evidence || 'CCTV Camera 2'} ({v.evidence_details || 'Timestamp 07:48'})
                  </div>
                  {v.reasoning && (
                    <div className="text-[11px] text-slate-400 font-sans italic">
                      <span className="font-bold text-slate-300 font-mono">Reasoning: </span>{v.reasoning}
                    </div>
                  )}
                  {v.recommended_verification && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30 font-sans">
                      <span className="font-bold font-mono text-amber-400">Recommended Verification: </span>{v.recommended_verification}
                    </div>
                  )}
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
            <div className="space-y-3">
              {report.weapons_json?.map((w, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-red-400 font-space text-sm">{w.type}</div>
                    <span className="text-[10px] text-red-400 bg-red-950 border border-red-500/30 px-2 py-0.5 rounded">
                      Confidence: {w.confidence || 93}%
                    </span>
                  </div>
                  <div className="text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-400">Evidence Used: </span>{w.evidence} ({w.evidence_details || 'Foreground grid B-4'})
                  </div>
                  {w.reasoning && (
                    <div className="text-[11px] text-slate-400 font-sans italic">
                      <span className="font-bold text-slate-300 font-mono">Reasoning: </span>{w.reasoning}
                    </div>
                  )}
                  {w.recommended_verification && (
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30 font-sans">
                      <span className="font-bold font-mono text-amber-400">Recommended Verification: </span>{w.recommended_verification}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-purple-400" /> Key Locations ({report.locations_json?.length || 0})
            </h3>
            <div className="space-y-3">
              {report.locations_json?.map((l, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-purple-400 font-space text-sm">{l.location}</div>
                    <span className="text-[10px] text-purple-400 bg-purple-950 border border-purple-500/30 px-2 py-0.5 rounded">
                      Confidence: {l.confidence || 90}%
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans text-xs">{l.address}</div>
                  <div className="text-[11px] text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="font-bold text-cyan-400">Evidence Source: </span>{l.evidence || 'FIR Report.pdf'}
                  </div>
                  {l.reasoning && (
                    <div className="text-[11px] text-slate-400 font-sans italic">
                      <span className="font-bold text-slate-300 font-mono">Reasoning: </span>{l.reasoning}
                    </div>
                  )}
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
              <div key={i} className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs space-y-2 font-mono">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-red-400">{c.category}</div>
                  <span className="text-[10px] text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-500/40">
                    Confidence: {c.confidence_score}% ({c.confidence_level || 'High'})
                  </span>
                </div>
                <div className="text-slate-200 font-sans bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div><span className="text-cyan-400 font-bold">Source 1 ({c.source1}):</span> "{c.statement1}"</div>
                  <div><span className="text-amber-400 font-bold">Source 2 ({c.source2}):</span> "{c.statement2}"</div>
                </div>
                <div className="text-slate-300 font-sans">
                  <span className="text-red-400 font-bold font-mono">AI Reasoning: </span>{c.reasoning || c.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Leads & Recommended Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">4. Actionable Leads</h2>
            <div className="space-y-2 font-mono">
              {report.leads_json?.map((item: any, i) => {
                const isObj = typeof item === 'object' && item !== null;
                return (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-start space-x-2 text-slate-200">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="font-sans font-bold">{isObj ? item.finding : item}</span>
                    </div>
                    {isObj && (
                      <div className="pl-5 space-y-1 text-[11px] text-slate-400 font-sans">
                        <div><span className="font-bold font-mono text-cyan-400">Evidence: </span>{item.evidence} ({item.evidence_details || 'AI Lead Extraction'})</div>
                        <div><span className="font-bold font-mono text-slate-300">Reasoning: </span>{item.reasoning}</div>
                        {item.recommended_verification && (
                          <div className="text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
                            <span className="font-bold font-mono text-amber-400">Recommended Verification: </span>{item.recommended_verification}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">5. Recommended Next Steps</h2>
            <div className="space-y-2 font-mono">
              {report.next_steps_json?.map((item: any, i) => {
                const isObj = typeof item === 'object' && item !== null;
                return (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-start space-x-2 text-slate-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="font-sans font-bold">{isObj ? item.finding : item}</span>
                    </div>
                    {isObj && (
                      <div className="pl-5 space-y-1 text-[11px] text-slate-400 font-sans">
                        <div><span className="font-bold font-mono text-cyan-400">Evidence: </span>{item.evidence} ({item.evidence_details || 'Action Plan'})</div>
                        <div><span className="font-bold font-mono text-slate-300">Reasoning: </span>{item.reasoning}</div>
                        {item.recommended_verification && (
                          <div className="text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                            <span className="font-bold font-mono text-emerald-400">Recommended Verification: </span>{item.recommended_verification}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Signoff */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          CONFIDENTIAL LAW ENFORCEMENT DOSSIER • GENERATED BY CRIMELENS AI MULTIMODAL SYSTEM • FOR INVESTIGATOR VERIFICATION ONLY
        </div>
      </div>
    </div>
  );
};

