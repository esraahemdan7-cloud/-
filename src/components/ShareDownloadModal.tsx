import React, { useState } from 'react';
import { Download, Share2, Copy, Check, ExternalLink, X, HelpCircle, Github } from 'lucide-react';

interface ShareDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadHtml: () => void;
}

export const ShareDownloadModal: React.FC<ShareDownloadModalProps> = ({
  isOpen,
  onClose,
  onDownloadHtml,
}) => {
  const [copied, setCopied] = useState(false);
  const [showGithubGuide, setShowGithubGuide] = useState(false);

  if (!isOpen) return null;

  // Compute the best shareable URL: use production shared URL or current location
  const fallbackUrl = 'https://ais-pre-buuktumho22v5t2zvvd524-591125665759.europe-west2.run.app';
  const currentUrl = typeof window !== 'undefined' && window.location.href ? window.location.href : fallbackUrl;
  const displayUrl = currentUrl.includes('localhost') ? fallbackUrl : currentUrl;

  const handleCopyLink = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(displayUrl);
      } else {
        const input = document.createElement('input');
        input.value = displayUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenNewTab = () => {
    window.open(displayUrl, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-download-heading"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#091d45] via-[#0c2658] to-[#071736] rounded-3xl border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(2,132,199,0.5)] p-5 sm:p-7 text-white max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-cyan-500/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg mb-2">
            <Share2 className="w-6 h-6" />
          </div>
          <h2 id="share-download-heading" className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide">
            تحميل ومشاركة اللعبة
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1">
            Download & Share Game — رابط مباشر وتشغيل بدون إنترنت
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-5 py-4 flex-1 text-right" dir="rtl">
          {/* Card 1: Direct Link */}
          <div className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-cyan-500/40 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 font-extrabold text-base sm:text-lg">
              <span className="text-xl">🔗</span>
              <span>رابط اللعبة المباشر (Shareable Live Link)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
              يمكنك نسخ هذا الرابط وإرساله مباشرة للطلاب والمعلمات لفتح اللعبة واللعب فوراً في أي متصفح (جوال أو كمبيوتر) بدون تحميل:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                dir="ltr"
                value={displayUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-mono select-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-sm transition-all shadow-md active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white border border-emerald-300'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-cyan-300/50'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>تم النسخ! ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleOpenNewTab}
                title="فتح في نافذة جديدة"
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-sm font-semibold transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">فتح</span>
              </button>
            </div>
            {copied && (
              <p className="text-emerald-300 text-xs font-bold mt-2 text-center animate-in fade-in">
                ✓ تم نسخ رابط اللعبة بنجاح إلى الحافظة!
              </p>
            )}
          </div>

          {/* Card 2: Standalone Offline Download */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/80 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-emerald-300 font-extrabold text-base sm:text-lg">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>تحميل اللعبة كملف مستقل (يعمل بدون إنترنت)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
              وفري عناء الإنترنت! يمكنك تنزيل ملف اللعبة كاملاً كملف <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">.html</code> مستقل.
              بمجرد نقر الملف مرتين، تفتح اللعبة بصوتها وأسئلتها وشعار المدرسة وتعمل على الكمبيوتر أو الشاشة التفاعلية حتى أثناء انقطاع الإنترنت!
            </p>

            <button
              id="download-offline-html-card-btn"
              type="button"
              onClick={onDownloadHtml}
              className="w-full py-3 px-5 rounded-xl font-black text-sm sm:text-base bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:brightness-110 text-white border border-emerald-300/60 shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>تحميل ملف اللعبة للكمبيوتر والجوال (Offline HTML)</span>
            </button>
          </div>

          {/* Card 3: GitHub & Settings Explanation */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/30">
            <button
              type="button"
              onClick={() => setShowGithubGuide(!showGithubGuide)}
              className="w-full flex items-center justify-between text-indigo-300 hover:text-indigo-200 font-bold text-sm select-none"
            >
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                <span>أين توجد إعدادات GitHub و Google AI Studio؟ (اضغطي هنا للتفاصيل)</span>
              </div>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </button>

            {showGithubGuide && (
              <div className="mt-3 pt-3 border-t border-indigo-500/20 text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed animate-in fade-in">
                <p className="font-semibold text-amber-200">
                  إذا كنتِ تبحثين عن زر التصدير إلى GitHub أو تنزيل ملفات الكود (ZIP):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pr-2 text-slate-300">
                  <li>
                    <strong className="text-white">في واجهة Google AI Studio (الصفحة الرئيسية فوق اللعبة):</strong>
                    انظري في الشريط العلوي للموقع خارج إطار شاشة اللعبة.
                  </li>
                  <li>
                    ستجدين في الزاوية العلوية زر <strong>Share</strong> أو قائمة الإعدادات <strong>Settings (⚙️ أو ⋯ ثلاث نقاط)</strong>.
                  </li>
                  <li>
                    بالضغط عليها يظهر لكِ خيار <strong>Export to GitHub</strong> لتصدير المشروع إلى حسابك، أو <strong>Download ZIP</strong> لتنزيل المشروع كاملاً.
                  </li>
                  <li>
                    <strong className="text-emerald-300">ملاحظة هامة:</strong> لا تحتاجي إلى GitHub لتشغيل اللعبة! يمكنك فقط نسخ <span className="underline">رابط اللعبة المباشر</span> بالأعلى أو ضغط زر <span className="underline">تحميل ملف اللعبة</span> لتشغيلها مباشرة على أي جهاز بكل سهولة.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cyan-500/30 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 active:scale-95 transition-all"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-300/40 shadow-md active:scale-95 transition-all"
          >
            متابعة اللعب ▶
          </button>
        </div>
      </div>
    </div>
  );
};
