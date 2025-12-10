import React, { useState } from 'react';

interface ReportViewerModalProps {
    onClose: () => void;
    onPrint: () => void;
    children: React.ReactNode;
    title: string;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ onClose, onPrint, children, title }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = () => {
        setIsGenerating(true);
        const element = document.getElementById('printable-report-content');
        
        if (!element) {
            console.error("Report content not found");
            setIsGenerating(false);
            return;
        }

        // Sanitize filename
        const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Use the window object to access the library loaded via CDN
        const html2pdf = (window as any).html2pdf;

        if (html2pdf) {
            html2pdf().set(opt).from(element).save().then(() => {
                setIsGenerating(false);
            }).catch((err: any) => {
                console.error("PDF Generation Error", err);
                setIsGenerating(false);
                alert("Failed to generate PDF. You can try the Print button as an alternative.");
            });
        } else {
            console.error("html2pdf library not loaded");
            setIsGenerating(false);
            onPrint();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                        <p className="text-xs text-gray-500">Preview Mode</p>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Close
                        </button>
                        
                        <button 
                            onClick={onPrint}
                            className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                        >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                             Print
                        </button>

                        <button 
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95
                                ${isGenerating ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center relative">
                    {/* Visual Scaling Wrapper - This is scaled for viewing but NOT for ID targeting */}
                    <div className="origin-top transform scale-90 md:scale-100 transition-transform">
                         {/* Actual Content - ID is here, without transform on itself, ensuring html2canvas reads coordinates correctly */}
                         <div id="printable-report-content" className="bg-white shadow-xl min-h-[297mm]">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportViewerModal;