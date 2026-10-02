import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Helper to ensure custom Google Fonts (Tiro Devanagari Hindi, Rozha One, etc.)
 * are fully loaded into the browser font cache before taking canvas snapshots.
 */
const ensureFontsReady = async () => {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check notice:', e);
    }
  }
};

/**
 * Sanitizes titles for safe cross-platform file saving
 */
const getSafeFilename = (title, suffix = '') => {
  const clean = (title || 'Kavita')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 40);
  return `${clean}${suffix}`;
};

/**
 * Export a styled Kavita element to a high-resolution royal PDF
 * Preserves regional language ligatures (Hindi, Urdu, Bengali, Gujarati, Marathi, Sanskrit, etc.)
 * with zero font corruption and zero weird symbols.
 */
export const exportKavitaToPdf = async (elementIdOrData, title = 'Kavita') => {
  await ensureFontsReady();

  let targetElement = null;
  let tempContainer = null;

  if (typeof elementIdOrData === 'string') {
    targetElement = document.getElementById(elementIdOrData);
  }

  // If element is not found or is hidden (display: none), construct a royal offscreen canvas
  if (!targetElement || targetElement.offsetParent === null) {
    let poemData = typeof elementIdOrData === 'object' ? elementIdOrData : null;

    if (!poemData && targetElement) {
      // Clone target into offscreen visible element
      tempContainer = document.createElement('div');
      tempContainer.className = targetElement.className.replace('hidden', '');
      tempContainer.innerHTML = targetElement.innerHTML;
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '700px';
      tempContainer.style.zIndex = '-9999';
      tempContainer.style.background = '#fcf8f0';
      tempContainer.style.color = '#2d1810';
      document.body.appendChild(tempContainer);
      targetElement = tempContainer;
    } else if (poemData) {
      tempContainer = createPoemDomPage(poemData);
      document.body.appendChild(tempContainer);
      targetElement = tempContainer;
    }
  }

  if (!targetElement) {
    console.error('No valid target found for PDF export.');
    return false;
  }

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2.4, // High-DPI crisp rendering
      useCORS: true,
      logging: false,
      backgroundColor: null,
      windowWidth: 800,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const maxImgWidth = pageWidth - margin * 2;
    const maxImgHeight = pageHeight - margin * 2;

    let imgWidth = maxImgWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > maxImgHeight) {
      imgHeight = maxImgHeight;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }

    const xOffset = (pageWidth - imgWidth) / 2;
    const yOffset = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

    const filename = `${getSafeFilename(title, '_Folio')}.pdf`;
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    alert('PDF export encountered an issue. Please try again.');
    return false;
  } finally {
    if (tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};

/**
 * Export a styled Kavita element as a high-res PNG image card (for WhatsApp/Instagram)
 */
export const exportKavitaToImageCard = async (elementId, title = 'Kavita') => {
  await ensureFontsReady();

  let element = document.getElementById(elementId);
  let tempContainer = null;

  if (!element || element.offsetParent === null) {
    if (element) {
      tempContainer = document.createElement('div');
      tempContainer.className = element.className.replace('hidden', '');
      tempContainer.innerHTML = element.innerHTML;
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '700px';
      tempContainer.style.zIndex = '-9999';
      tempContainer.style.background = '#170e24';
      document.body.appendChild(tempContainer);
      element = tempContainer;
    }
  }

  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // Ultra-sharp 3x resolution
      useCORS: true,
      logging: false,
      backgroundColor: null,
      windowWidth: 800,
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${getSafeFilename(title, '_Card')}.png`;
    link.href = image;
    link.click();
    return true;
  } catch (error) {
    console.error('Failed to export image card:', error);
    return false;
  } finally {
    if (tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};

/**
 * Export a single poem to clean UTF-8 text file with UTF-8 BOM
 * Guaranteed to NEVER show weird symbols or mojibake in Windows Notepad or mobile apps.
 */
export const exportKavitaToText = (kavita) => {
  if (!kavita) return;

  const header = `═══════════════════════════════════════════════════════\n` +
    `               ${kavita.title.toUpperCase()}\n` +
    (kavita.subtitle ? `           — ${kavita.subtitle} —\n` : '') +
    `═══════════════════════════════════════════════════════\n\n` +
    `रचयिता / Poet: ${kavita.authorName} ${kavita.penName ? `"${kavita.penName}"` : ''}\n` +
    `भाषा / Language: ${kavita.language || 'Hindi'}  |  रस: ${kavita.rasa || 'Shant'}\n` +
    `शैली / Form: ${kavita.form || 'Mukt Kavya'}\n` +
    `═══════════════════════════════════════════════════════\n\n`;

  let body = '';
  if (kavita.stanzas && kavita.stanzas.length > 0) {
    body = kavita.stanzas
      .map((s, idx) => `[छंद / Stanza ${s.stanzaNumber || idx + 1}]\n${s.lines ? s.lines.join('\n') : s}`)
      .join('\n\n✦ ✦ ✦\n\n');
  } else {
    body = kavita.content;
  }

  const footer = `\n\n═══════════════════════════════════════════════════════\n` +
    `संग्रह: मुक्त काव्य (Mukt Kavya)\n` +
    `दिनांक: ${new Date(kavita.createdAt || Date.now()).toLocaleDateString('hi-IN')}\n` +
    `═══════════════════════════════════════════════════════\n`;

  const fullText = header + body + footer;

  // UTF-8 BOM (\uFEFF) ensures Windows Notepad & Excel open in pristine UTF-8 without garbled symbols!
  const blob = new Blob(['\uFEFF' + fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${getSafeFilename(kavita.title, '_Verse')}.txt`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper to construct an authentic, royal offscreen DOM page for Diwan anthology PDF
 */
const createCoverDomPage = (anthologyData) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 at 96 DPI
  container.style.height = '1123px';
  container.style.padding = '48px';
  container.style.background = 'radial-gradient(ellipse at center, #24131d 0%, #120914 70%, #080309 100%)';
  container.style.boxSizing = 'border-box';
  container.style.color = '#fceda2';
  container.style.fontFamily = "'Rozha One', 'Tiro Devanagari Hindi', 'Cinzel', serif";
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';
  container.style.textAlign = 'center';

  container.innerHTML = `
    <div style="border: 2px solid #d4af37; outline: 1px solid rgba(212,175,55,0.4); outline-offset: 6px; width: 100%; height: 100%; padding: 40px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 14px; letter-spacing: 0.3em; text-transform: uppercase; color: #d4af37; margin-top: 16px;">
          ✦ MUKT KAVYA ROYAL ARCHIVE ✦
        </div>
        <div style="font-size: 38px; color: #ffd700; margin-top: 24px; font-weight: bold; letter-spacing: 0.05em;">
          दीवान-ए-काव्य
        </div>
        <div style="font-size: 16px; color: #e6c875; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 8px;">
          Anthology of Masterpiece Verses
        </div>
      </div>

      <div style="margin: 40px 0;">
        <div style="font-size: 22px; color: #d4af37; margin-bottom: 12px;">❦ ════ •⊰❂⊱• ════ ❦</div>
        <div style="font-size: 32px; font-weight: bold; color: #ffffff; margin-bottom: 6px;">
          ${anthologyData.poetName}
        </div>
        ${anthologyData.penName ? `<div style="font-size: 20px; color: #f5e7a9; font-style: italic;">(${anthologyData.penName})</div>` : ''}
        ${anthologyData.bio ? `<div style="font-size: 14px; max-width: 500px; color: #cbd5e1; margin-top: 16px; line-height: 1.6; font-family: sans-serif;">${anthologyData.bio}</div>` : ''}
        <div style="font-size: 22px; color: #d4af37; margin-top: 16px;">❦ ════ •⊰❂⊱• ════ ❦</div>
      </div>

      <div style="border-top: 1px solid rgba(212,175,55,0.3); width: 80%; padding-top: 24px; margin-bottom: 16px;">
        <div style="font-size: 15px; color: #e2e8f0; font-family: sans-serif;">
          Total Masterpieces Compiled: <strong>${anthologyData.totalPoems}</strong>
        </div>
        <div style="font-size: 12px; color: #94a3b8; font-family: sans-serif; margin-top: 6px;">
          Preserved on ${new Date(anthologyData.exportTimestamp).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  `;
  return container;
};

const createPoemDomPage = (p, index = 0, total = 1) => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px';
  container.style.height = '1123px';
  container.style.padding = '48px';
  container.style.background = '#fcf8f0';
  container.style.boxSizing = 'border-box';
  container.style.color = '#2d1810';
  container.style.fontFamily = "'Tiro Devanagari Hindi', 'Rozha One', serif";
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';

  const stanzasHtml = (p.stanzas && p.stanzas.length > 0)
    ? p.stanzas.map((st) => `
        <div style="margin-bottom: 18px; line-height: 1.8; font-size: 16px; text-align: center; color: #382417; font-weight: 500;">
          ${(st.lines ? st.lines.join('<br>') : st)}
        </div>
      `).join('<div style="text-align: center; color: #b8934a; font-size: 12px; margin: 12px 0;">✦ ✦ ✦</div>')
    : `<div style="line-height: 1.9; font-size: 16px; text-align: center; color: #382417; white-space: pre-line;">${p.content}</div>`;

  container.innerHTML = `
    <div style="border: 1.5px solid #b8934a; outline: 0.5px solid rgba(184,147,74,0.4); outline-offset: 5px; width: 100%; height: 100%; padding: 36px 44px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="text-align: center; font-size: 13px; color: #9c6c2e; margin-bottom: 8px;">
          ❦ ════ •⊰❂⊱• ════ ❦
        </div>
        <h1 style="font-size: 26px; text-align: center; color: #6e190f; margin: 0 0 6px 0; font-family: 'Rozha One', 'Tiro Devanagari Hindi', serif; font-weight: bold;">
          ${p.heading || p.title}
        </h1>
        ${p.subtitle ? `<div style="font-size: 14px; text-align: center; color: #8c5828; font-style: italic; margin-bottom: 12px;">— ${p.subtitle} —</div>` : ''}

        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; font-family: sans-serif; font-size: 11px;">
          <span style="background: rgba(128,0,32,0.08); border: 1px solid rgba(128,0,32,0.2); padding: 2px 10px; border-radius: 12px; color: #800020; font-weight: 600;">
            ${p.language || 'Hindi'}
          </span>
          <span style="background: rgba(184,147,74,0.12); border: 1px solid rgba(184,147,74,0.3); padding: 2px 10px; border-radius: 12px; color: #7a5818; font-weight: 600;">
            ${p.rasa || 'Shant'}
          </span>
          <span style="background: rgba(30,41,59,0.06); border: 1px solid rgba(30,41,59,0.15); padding: 2px 10px; border-radius: 12px; color: #334155; font-weight: 600;">
            ${p.form || 'Mukt Kavya'}
          </span>
        </div>

        <div style="max-height: 700px; overflow: hidden;">
          ${stanzasHtml}
        </div>
      </div>

      <div style="border-top: 1px solid rgba(184,147,74,0.3); padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #8c6d48; font-family: sans-serif;">
        <div>
          <strong>Mukt Kavya Sanctuary</strong> • पृष्ठ ${index + 1} / ${total}
        </div>
        <div style="font-family: 'Tiro Devanagari Hindi', serif; font-size: 13px; color: #6e190f; font-weight: bold;">
          ✍️ ${p.authorName || ''} ${p.penName ? `"${p.penName}"` : ''}
        </div>
      </div>
    </div>
  `;
  return container;
};

/**
 * Export All Poems of a Poet into a structured Royal Anthology (Diwan) PDF
 * Renders pages using offscreen HTML canvas with Google Fonts so Indian ligatures
 * (Devanagari, Urdu, Gujarati, etc.) NEVER convert into weird symbols or gibberish!
 */
export const exportAnthologyBook = async (anthologyData) => {
  if (!anthologyData || !anthologyData.poems || anthologyData.poems.length === 0) {
    alert('No poems found to export in your anthology.');
    return false;
  }

  await ensureFontsReady();

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  try {
    // 1. Render Cover Page
    const coverElem = createCoverDomPage(anthologyData);
    document.body.appendChild(coverElem);

    const coverCanvas = await html2canvas(coverElem, {
      scale: 2.0,
      useCORS: true,
      logging: false,
    });
    document.body.removeChild(coverElem);

    const coverImg = coverCanvas.toDataURL('image/png');
    pdf.addImage(coverImg, 'PNG', 0, 0, pageWidth, pageHeight);

    // 2. Render Each Poem Page
    for (let i = 0; i < anthologyData.poems.length; i++) {
      const p = anthologyData.poems[i];
      pdf.addPage();

      const poemElem = createPoemDomPage(p, i, anthologyData.poems.length);
      document.body.appendChild(poemElem);

      const poemCanvas = await html2canvas(poemElem, {
        scale: 2.0,
        useCORS: true,
        logging: false,
      });
      document.body.removeChild(poemElem);

      const poemImg = poemCanvas.toDataURL('image/png');
      pdf.addImage(poemImg, 'PNG', 0, 0, pageWidth, pageHeight);
    }

    const safePoet = getSafeFilename(anthologyData.poetName || 'Poet', '_Diwan_Book');
    pdf.save(`${safePoet}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to export anthology book:', err);
    alert('Anthology export failed. Please check browser console.');
    return false;
  }
};

/**
 * Export complete anthology as a formatted UTF-8 Text Book with BOM
 */
export const exportAnthologyTextArchive = (anthologyData) => {
  if (!anthologyData || !anthologyData.poems) return;

  let text = `╔══════════════════════════════════════════════════════════════════╗\n` +
    `                    दीवान-ए-${(anthologyData.penName || anthologyData.poetName).toUpperCase()}\n` +
    `               MUKT KAVYA POETIC ANTHOLOGY\n` +
    `╚══════════════════════════════════════════════════════════════════╝\n\n` +
    `रचयिता / Poet: ${anthologyData.poetName} ${anthologyData.penName ? `(${anthologyData.penName})` : ''}\n` +
    `जीवन परिचय / Bio: ${anthologyData.bio || 'Poet of Mukt Kavya'}\n` +
    `कुल रचनाएं / Total Poems: ${anthologyData.totalPoems}\n` +
    `संकलन तिथि / Compiled On: ${new Date(anthologyData.exportTimestamp).toLocaleDateString('hi-IN')}\n\n` +
    `═`.repeat(66) + `\n\n`;

  anthologyData.poems.forEach((p, idx) => {
    text += `[रचना संख्या / Poem #${idx + 1}]\n` +
      `शीर्षक: ${p.heading || p.title}\n` +
      (p.subtitle ? `उपकथन: ${p.subtitle}\n` : '') +
      `भाषा: ${p.language}  |  रस: ${p.rasa}  |  शैली: ${p.form}\n` +
      `-`.repeat(66) + `\n\n` +
      `${p.content}\n\n` +
      `═`.repeat(66) + `\n\n`;
  });

  const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${getSafeFilename(anthologyData.poetName, '_Diwan_TextEdition')}.txt`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
