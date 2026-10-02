import React from 'react';
import { ExternalLink, ArrowUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer = () => {
  const { isDark } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`mt-14 sm:mt-20 border-t transition-colors duration-300 ${
        isDark
          ? 'bg-[#060810] border-[#d4af37]/25 text-slate-400'
          : 'bg-[#f4ede0] border-[#b8860b]/30 text-stone-700'
      } py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-['Poppins']`}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center space-y-6">
        {/* Brand Emblem & Title */}
        <div className="flex flex-col items-center gap-2">
          <div
            style={{ width: '44px', height: '44px' }}
            className={`rounded-2xl p-0.5 shadow-lg flex items-center justify-center ${
              isDark
                ? 'bg-gradient-to-tr from-[#800020] via-[#b8860b] to-[#ffd700]'
                : 'bg-gradient-to-tr from-[#800020] to-[#b8860b]'
            }`}
          >
            <div
              style={{ width: '100%', height: '100%' }}
              className={`rounded-[14px] flex items-center justify-center overflow-hidden ${
                isDark ? 'bg-[#0b0f19]' : 'bg-white'
              }`}
            >
              <img
                src="/logo.png"
                alt="Mukt Kavya Logo"
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          <h2
            className={`text-2xl font-bold font-['Rozha_One'] tracking-wide ${
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f5e7a9] to-[#d4af37]'
                : 'text-[#800020]'
            }`}
          >
            मुक्त काव्य
          </h2>
        </div>

        {/* Clean Language & Tradition Strip */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-medium px-2 ${
            isDark ? 'text-slate-300' : 'text-stone-700'
          }`}
        >
          <span className="hover:text-[#800020] dark:hover:text-[#ffd700] transition-colors cursor-pointer">
            हिन्दी
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-stone-300'}>•</span>
          <span className="hover:text-[#800020] dark:hover:text-[#ffd700] transition-colors cursor-pointer">
            اردو शायरी
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-stone-300'}>•</span>
          <span className="hover:text-[#800020] dark:hover:text-[#ffd700] transition-colors cursor-pointer">
            मराठी
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-stone-300'}>•</span>
          <span className="hover:text-[#800020] dark:hover:text-[#ffd700] transition-colors cursor-pointer">
            ગુજરાતી
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-stone-300'}>•</span>
          <span className="hover:text-[#800020] dark:hover:text-[#ffd700] transition-colors cursor-pointer">
            বাংলা
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-stone-300'}>•</span>
          <span className="hover:text-[#800020] dark:hover:text-[#ffd700] transition-colors cursor-pointer">
            English Indian Verse
          </span>
        </div>

        {/* Premium Social Pills: Instagram & YouTube */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
          {/* Instagram Link */}
          <a
            href="https://www.instagram.com/mukt_kavya"
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs font-medium transition-all shadow-sm hover:scale-105 cursor-pointer ${
              isDark
                ? 'bg-slate-900/90 hover:bg-[#e1306c]/15 border-slate-800 hover:border-[#e1306c]/60 text-slate-300 hover:text-white'
                : 'bg-white hover:bg-rose-50 border-stone-300 hover:border-[#e1306c]/60 text-stone-800 hover:text-rose-900 shadow-sm'
            }`}
            title="Follow @mukt_kavya on Instagram"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shrink-0">
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span>Instagram:</span>
            <span className={isDark ? 'text-[#f5e7a9] font-semibold' : 'text-[#800020] font-bold'}>
              @mukt_kavya
            </span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </a>

          {/* YouTube Link */}
          <a
            href="https://www.youtube.com/@MuktKavya"
            target="_blank"
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs font-medium transition-all shadow-sm hover:scale-105 cursor-pointer ${
              isDark
                ? 'bg-slate-900/90 hover:bg-[#ff0000]/15 border-slate-800 hover:border-[#ff0000]/60 text-slate-300 hover:text-white'
                : 'bg-white hover:bg-red-50 border-stone-300 hover:border-[#ff0000]/60 text-stone-800 hover:text-red-900 shadow-sm'
            }`}
            title="Subscribe on YouTube: मुक्त काव्य"
          >
            <div className="w-4 h-4 rounded-full bg-[#ff0000] flex items-center justify-center text-white shrink-0">
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <span>YouTube:</span>
            <span className={isDark ? 'text-rose-200 font-semibold' : 'text-[#800020] font-bold'}>
              मुक्त काव्य
            </span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </a>
        </div>

        {/* Bottom Line: Copyright & Back to Top */}
        <div
          className={`w-full pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDark ? 'border-slate-800/80 text-slate-500' : 'border-stone-300 text-stone-500'
          }`}
        >
          <div>
            © {new Date().getFullYear()}{' '}
            <span className={isDark ? 'text-slate-300 font-medium' : 'text-stone-800 font-semibold'}>
              मुक्त काव्य (Mukt Kavya)
            </span>
            . All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-[#d4af37]'
                : 'text-stone-600 hover:text-[#800020] font-medium'
            }`}
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
