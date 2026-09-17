/* ===================================================================
   Bagimliliksiz, akisa uygun kucuk bir Markdown olusturucu.
   Kaynak once kacisa ugratilir, sonra blok blok islenir; boylece
   model ciktisindaki HTML asla calistirilmaz.
   =================================================================== */
(function (global) {
  'use strict';

  const esc = (s) => s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const NUL = '\u0000';
  const FENCE = NUL + 'F';
  const CODE = NUL + 'C';
  const END = NUL;

  const RE_FENCE_LINE = new RegExp('^' + FENCE + '(\\d+)' + END + '$');
  const RE_LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+/;
  const RE_HR = /^ {0,3}([-*_])(\s*\1){2,}\s*$/;
  const RE_QUOTE = /^ {0,3}&gt;/;

  /* ------------------------------------------------ satir ici bicimlendirme */

  function inline(text) {
    const codes = [];
    // Once satir ici kodu ayir; icindeki yildiz/alt tire islenmesin.
    text = text.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (_m, _t, body) => {
      codes.push('<code>' + body.trim() + '</code>');
      return CODE + (codes.length - 1) + END;
    });

    text = text
      // [metin](url)
      .replace(/\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))*)(?:\s+&quot;[^&]*&quot;)?\)/g,
        (_m, label, href) => safeLink(href, label || href))
      // ciplak baglantilar
      .replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<)]+[^\s<).,;:!?])/g,
        (_m, pre, url) => pre + safeLink(url.startsWith('www.') ? 'http://' + url : url, url))
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])__([\s\S]+?)__(?![\w_])/g, '$1<strong>$2</strong>')
      .replace(/(^|[^_\w])_([^_\n]+)_(?![\w_])/g, '$1<em>$2</em>')
      .replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');

    return text.replace(new RegExp(CODE + '(\\d+)' + END, 'g'), (_m, i) => codes[+i]);
  }

  function safeLink(href, label) {
    // javascript:/data: gibi semalari disarida birak.
    if (!/^(https?:|mailto:|#|\/)/i.test(href)) return label;
    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
  }

  /* ------------------------------------------------ blok ayristirma */

  function parseBlocks(lines, fences) {
    let out = '';
    let i = 0;
    const isBlank = (l) => !l || !l.trim();

    while (i < lines.length) {
      const line = lines[i];
      if (isBlank(line)) { i++; continue; }

      // --- kod blogu yer tutucusu
      let m = line.match(RE_FENCE_LINE);
      if (m) { out += fences[+m[1]]; i++; continue; }

      // --- yatay cizgi
      if (RE_HR.test(line)) { out += '<hr>'; i++; continue; }

      // --- baslik
      m = line.match(/^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (m) { const n = m[1].length; out += '<h' + n + '>' + inline(m[2]) + '</h' + n + '>'; i++; continue; }

      // --- alinti ( '>' kacis sonrasi '&gt;' olur )
      if (RE_QUOTE.test(line)) {
        const buf = [];
        while (i < lines.length && (RE_QUOTE.test(lines[i]) || (!isBlank(lines[i]) && buf.length))) {
          buf.push(lines[i].replace(/^ {0,3}&gt;\s?/, ''));
          i++;
        }
        out += '<blockquote>' + parseBlocks(buf, fences) + '</blockquote>';
        continue;
      }

      // --- tablo (baslik satiri + ayirici satiri)
      if (line.includes('|') && i + 1 < lines.length
          && /^[\s|:-]+$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
        const cells = (l) => l.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
        const head = cells(line);
        const align = cells(lines[i + 1]).map((c) =>
          /^:-+:$/.test(c) ? ' style="text-align:center"'
          : /-+:$/.test(c) ? ' style="text-align:right"' : '');
        i += 2;
        const body = [];
        while (i < lines.length && lines[i].includes('|') && !isBlank(lines[i])) { body.push(cells(lines[i])); i++; }
        out += '<div class="table-wrap"><table><thead><tr>'
          + head.map((c, k) => '<th' + (align[k] || '') + '>' + inline(c) + '</th>').join('')
          + '</tr></thead><tbody>'
          + body.map((r) => '<tr>' + head.map((_c, k) =>
              '<td' + (align[k] || '') + '>' + inline(r[k] || '') + '</td>').join('') + '</tr>').join('')
          + '</tbody></table></div>';
        continue;
      }

      // --- liste
      m = line.match(RE_LIST);
      if (m) {
        const res = parseList(lines, i, m[1].length, fences);
        out += res[0]; i = res[1]; continue;
      }

      // --- paragraf
      const buf = [];
      while (i < lines.length && !isBlank(lines[i])
             && !/^ {0,3}#{1,6}\s/.test(lines[i])
             && !RE_QUOTE.test(lines[i])
             && !RE_FENCE_LINE.test(lines[i])
             && !RE_LIST.test(lines[i])
             && !RE_HR.test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      if (buf.length) {
        out += '<p>' + inline(buf.join('\n').replace(/ {2,}\n/g, '<br>').replace(/\n/g, ' ')) + '</p>';
      } else { i++; }
    }
    return out;
  }

  /** Girintiye gore ic ice listeleri isler. */
  function parseList(lines, start, indent, fences) {
    const first = lines[start].match(RE_LIST);
    const ordered = /\d/.test(first[2]);
    const items = [];
    let i = start;
    let current = null;

    let blank = false;

    while (i < lines.length) {
      const line = lines[i];
      const m = line.match(/^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/);

      // Next item at same indent level
      if (m && m[1].length <= indent + 1) {
        if (m[1].length < indent) break;
        if (/\d/.test(m[2]) !== ordered) break; // marker type changed: new list
        current = [m[3]];
        items.push(current);
        i++; blank = false;
        continue;
      }
      if (!current) break;

      if (!line.trim()) { blank = true; i++; continue; }

      const indented = /^\s{2,}/.test(line) || (m && m[1].length > indent);
      // Bos satirdan sonra girintisiz satir listeyi bitirir.
      if (!indented && blank) break;
      if (!indented) { current.push(line.trim()); i++; continue; } // gevsek devam

      if (blank) { current.push(''); blank = false; }
      current.push(line.replace(new RegExp('^ {0,' + (indent + 2) + '}'), ''));
      i++;
    }

    const body = items.map((it) => {
      const inner = parseBlocks(it, fences);
      // Tek paragrafli maddelerde <p> sarmalayicisini kaldir.
      const tight = inner.replace(/^<p>([\s\S]*?)<\/p>/, (mm, g) => (g.indexOf('<p>') >= 0 ? mm : g));
      return '<li>' + tight + '</li>';
    }).join('');

    const tag = ordered ? 'ol' : 'ul';
    return ['<' + tag + '>' + body + '</' + tag + '>', i];
  }

  /* ------------------------------------------------ giris noktasi */

  function render(src) {
    if (!src) return '';
    src = String(src).replace(/\r\n?/g, '\n').split(NUL).join('');

    // Kod bloklarini once cikar (akis sirasinda kapanmamis olanlar dahil).
    const ex = extractFences(src);
    return parseBlocks(esc(ex.text).split('\n'), ex.fences);
  }

  /**
   * Cit ile cevrili kod bloklarini satir satir ayirir ve yerlerine yer tutucu
   * koyar. Kapanis citi yoksa blok metnin sonuna kadar uzar; boylece akis
   * sirasinda yarim gelen kod da dogru gorunur.
   */
  function extractFences(src) {
    const lines = src.split('\n');
    const kept = [];
    const fences = [];
    let i = 0;

    while (i < lines.length) {
      const open = lines[i].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (!open) { kept.push(lines[i]); i++; continue; }

      const marker = open[1][0];
      const width = open[1].length;
      const lang = open[2].trim().split(/\s+/)[0];
      const body = [];
      i++;
      while (i < lines.length) {
        const close = lines[i].match(/^ {0,3}(`{3,}|~{3,})\s*$/);
        if (close && close[1][0] === marker && close[1].length >= width) { i++; break; }
        body.push(lines[i]); i++;
      }
      fences.push(codeBlock(lang, body.join('\n')));
      kept.push(FENCE + (fences.length - 1) + END);
    }
    return { text: kept.join('\n'), fences: fences };
  }

  function codeBlock(lang, code) {
    const isHtml = /^(html|svg|xml)$/i.test(lang) || /<!DOCTYPE|<html|<svg/i.test(code);
    const getI18n = (k, def) => (global.getAppI18n && global.getAppI18n(k)) || def;
    const prevText = getI18n('preview', 'Önizle');
    const copyText = getI18n('copy', 'Kopyala');
    const langLabel = lang || getI18n('textLang', 'metin');
    const centerPrevBtn = isHtml
      ? '<div class="code-head-center"><button type="button" class="code-preview-btn" data-preview-code aria-label="' + prevText + '">'
        + '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        + '<span>' + prevText + '</span></button></div>'
      : '';
    return '<div class="code-block"><div class="code-head"><span class="code-lang">' + esc(langLabel) + '</span>'
      + centerPrevBtn
      + '<div class="code-actions">'
      + '<button type="button" data-copy-code aria-label="' + copyText + '">'
      + '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/>'
      + '<path d="M5 15V5a2 2 0 012-2h10"/></svg>' + copyText + '</button></div></div>'
      + '<pre><code>' + esc(code) + '</code></pre></div>';
  }

  global.md = { render: render, escape: esc };
})(window);
