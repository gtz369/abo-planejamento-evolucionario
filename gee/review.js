(() => {
  const welcomeOverlay = document.querySelector('#review-welcome-overlay');
  const welcomeDialog = document.querySelector('#review-welcome');
  const welcomeStartButton = document.querySelector('#review-welcome-start');
  const toolbar = document.querySelector('#review-toolbar');
  const launchButton = document.querySelector('#review-launch');
  const exportButton = document.querySelector('#review-export');
  const clearButton = document.querySelector('#review-clear');
  const closeButton = document.querySelector('#review-close');
  const minimizeButton = document.querySelector('#review-minimize');
  const countLabel = document.querySelector('#review-count');
  const helpText = document.querySelector('#review-help');
  const popover = document.querySelector('#review-dialog');
  const popoverKicker = document.querySelector('#review-popover-kicker');
  const form = popover;
  const noteField = document.querySelector('#review-note');
  const quoteLabel = document.querySelector('#review-section-title');
  const cancelButton = document.querySelector('#review-cancel');
  const closePopoverButton = document.querySelector('#review-dialog-close');
  const deleteButton = document.querySelector('#review-delete');
  const sections = [...document.querySelectorAll('header, main, main > section, main > .format-strip, footer')];
  const sampleId = new URLSearchParams(location.search).get('review-sample');
  const storageKey = `abo-gee-review:${location.pathname}${sampleId ? `:sample:${sampleId}` : ''}`;
  if (sampleId === 'gee-2026-10-16' && !localStorage.getItem(storageKey)) {
    const section = document.querySelector('#programa');
    const title = sectionTitle(section);
    const content = sectionText(section);
    const firstQuote = 'Depois das escolhas estratégicas, começa o desafio de mantê-las conectadas às decisões do dia a dia.';
    const secondQuote = 'As reuniões acompanham tarefas, mas nem sempre discutem valor, capacidades e aprendizado.';
    const createTextNote = (id, quote, text) => {
      const start = content.indexOf(quote);
      return {
        id,
        sectionId: 'programa',
        sectionTitle: title,
        start,
        end: start + quote.length,
        quote,
        prefix: content.slice(Math.max(0, start - 48), start),
        suffix: content.slice(start + quote.length, start + quote.length + 48),
        text,
        createdAt: '2026-10-16T12:00:00.000Z'
      };
    };
    localStorage.setItem(storageKey, JSON.stringify([
      {
        id: 'client-sample-whole-band',
        sectionId: 'programa',
        sectionTitle: title,
        scope: 'section',
        start: 0,
        end: 0,
        quote: title,
        prefix: '',
        suffix: '',
        text: 'passar para a faixa 2',
        xRatio: 0.96,
        yRatio: 0.06,
        createdAt: '2026-10-16T12:00:00.000Z'
      },
      createTextNote('client-sample-note-2', firstQuote, 'gtz criativo'),
      createTextNote('client-sample-note-3', secondQuote, 'lorem ipsum dolor')
    ]));
  }
  if (sampleId === 'gee-2026-10-16-v2' && !localStorage.getItem(storageKey)) {
    const makeTextNote = (id, sectionId, section, quote, text) => {
      const content = sectionText(section);
      const start = content.indexOf(quote);
      return {
        id,
        sectionId,
        sectionTitle: sectionTitle(section),
        start,
        end: start + quote.length,
        quote,
        prefix: content.slice(Math.max(0, start - 48), start),
        suffix: content.slice(start + quote.length, start + quote.length + 48),
        text,
        createdAt: '2026-10-16T13:00:00.000Z'
      };
    };
    const hero = document.querySelector('main > section.hero');
    const program = document.querySelector('#programa');
    const rhythm = document.querySelector('#cadencia');
    localStorage.setItem(storageKey, JSON.stringify([
      makeTextNote(
        'client-sample-v2-note-1',
        'revisao-sua-estrategia-precisa-continuar-evoluindo-3',
        hero,
        'Sua estratégiaprecisa continuarevoluindo.',
        'lorem ipsum dolor'
      ),
      {
        id: 'client-sample-v2-note-2',
        sectionId: 'programa',
        sectionTitle: sectionTitle(program),
        scope: 'section',
        start: 0,
        end: 0,
        quote: sectionTitle(program),
        prefix: '',
        suffix: '',
        text: 'lorem lorem',
        xRatio: 0.29,
        yRatio: 0.49,
        createdAt: '2026-10-16T13:00:00.000Z'
      },
      makeTextNote(
        'client-sample-v2-note-3',
        'programa',
        program,
        'ABO Academy conduz esse desenvolvimento com treinamento, mentoria e coaching. Sua liderança assume as decisões e a condução do negócio.',
        'ipsum dolor sit amet'
      ),
      makeTextNote(
        'client-sample-v2-note-4',
        'cadencia',
        rhythm,
        'Revisões táticas e es',
        'clarificar'
      )
    ]));
  }
  let comments = readComments();
  let currentAnchor = null;
  let currentCommentId = null;
  let reviewMode = false;
  let savedRanges = new Map();

  function setWelcomeOpen(open) {
    welcomeOverlay.hidden = !open;
    document.body.classList.toggle('review-welcome-open', open);
    [document.querySelector('header'), document.querySelector('main'), document.querySelector('footer'), toolbar, launchButton, popover].forEach(element => {
      if (element) element.inert = open;
    });
    if (open) welcomeStartButton.focus({ preventScroll: true });
    else launchButton.focus({ preventScroll: true });
  }

  function readComments() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(stored)
        ? stored.filter(item => item && item.id && item.sectionId && item.quote && item.text)
        : [];
    } catch {
      return [];
    }
  }

  function saveComments() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(comments));
      return true;
    } catch {
      helpText.textContent = 'Este navegador bloqueou o salvamento local das anotações.';
      return false;
    }
  }

  function isAreaComment(comment) {
    return comment.scope === 'section' || comment.scope === 'area';
  }

  function sectionTitle(section) {
    if (section.tagName === 'HEADER') return 'Cabeçalho da página';
    if (section.tagName === 'FOOTER') return 'Rodapé da página';
    if (section.tagName === 'MAIN') return 'Página inteira';
    const heading = section.querySelector('h1, h2');
    const eyebrow = section.querySelector('.section-label .eyebrow, .eyebrow, .format-strip span');
    const source = heading || eyebrow;
    if (!source) return 'Seção da página';
    const clone = source.cloneNode(true);
    clone.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function slug(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function prepareSections() {
    sections.forEach((section, index) => {
      const title = sectionTitle(section);
      const id = section.id || `revisao-${slug(title) || 'trecho'}-${index + 1}`;
      if (!section.id) section.id = id;
      section.dataset.reviewId = id;
      section.dataset.reviewTitle = title;
    });
  }

  function textNodes(section) {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        if (node.parentElement?.closest('script, style, .review-ui')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    return nodes;
  }

  function sectionText(section) {
    return textNodes(section).map(node => node.nodeValue).join('');
  }

  function offsetFor(section, targetNode, targetOffset) {
    const target = document.createRange();
    target.setStart(targetNode, targetOffset);
    target.collapse(true);
    let offset = 0;
    for (const node of textNodes(section)) {
      if (node === targetNode) return offset + targetOffset;
      const nodeStart = document.createRange();
      nodeStart.setStart(node, 0);
      nodeStart.collapse(true);
      if (nodeStart.compareBoundaryPoints(Range.START_TO_START, target) < 0) {
        offset += node.nodeValue.length;
      } else {
        break;
      }
    }
    return targetNode === section || section.contains(targetNode) ? offset : null;
  }

  function rangeAt(section, start, end) {
    if (!section) return null;
    const nodes = textNodes(section);
    const range = document.createRange();
    let total = 0;
    let startSet = false;
    for (const node of nodes) {
      const next = total + node.nodeValue.length;
      if (!startSet && start >= total && start <= next) {
        range.setStart(node, start - total);
        startSet = true;
      }
      if (startSet && end >= total && end <= next) {
        range.setEnd(node, end - total);
        return range;
      }
      total = next;
    }
    return null;
  }

  function findCommentRange(comment) {
    if (isAreaComment(comment)) return null;
    const section = sections.find(item => item.dataset.reviewId === comment.sectionId);
    if (!section) return null;
    const fullText = sectionText(section);
    const expectedEnd = comment.start + comment.quote.length;
    if (fullText.slice(comment.start, expectedEnd) === comment.quote) {
      return rangeAt(section, comment.start, expectedEnd);
    }

    const candidates = [];
    let cursor = 0;
    while ((cursor = fullText.indexOf(comment.quote, cursor)) !== -1) {
      const before = fullText.slice(Math.max(0, cursor - comment.prefix.length), cursor);
      const after = fullText.slice(cursor + comment.quote.length, cursor + comment.quote.length + comment.suffix.length);
      const prefixScore = commonSuffixLength(before, comment.prefix);
      const suffixScore = commonPrefixLength(after, comment.suffix);
      candidates.push({ start: cursor, score: prefixScore + suffixScore - Math.abs(cursor - comment.start) / 1000 });
      cursor += 1;
    }
    candidates.sort((a, b) => b.score - a.score);
    const match = candidates[0];
    return match ? rangeAt(section, match.start, match.start + comment.quote.length) : null;
  }

  function commonSuffixLength(a, b) {
    let index = 0;
    while (index < a.length && index < b.length && a[a.length - index - 1] === b[b.length - index - 1]) index += 1;
    return index;
  }

  function commonPrefixLength(a, b) {
    let index = 0;
    while (index < a.length && index < b.length && a[index] === b[index]) index += 1;
    return index;
  }

  function removeFallbackMarks() {
    document.querySelectorAll('mark.review-mark').forEach(mark => mark.replaceWith(...mark.childNodes));
  }

  function clearHighlights() {
    if (window.CSS?.highlights) window.CSS.highlights.delete('review-mark');
    removeFallbackMarks();
    savedRanges = new Map();
  }

  function renderHighlights() {
    clearHighlights();
    const valid = comments.map(comment => ({ comment, range: findCommentRange(comment) })).filter(item => item.range);
    savedRanges = new Map(valid.map(item => [item.comment.id, item.range]));

    if (window.CSS?.highlights && typeof window.Highlight === 'function') {
      window.CSS.highlights.set('review-mark', new window.Highlight(...valid.map(item => item.range)));
      return;
    }

    const sectionOrder = new Map(sections.map((section, index) => [section.dataset.reviewId, index]));
    valid.sort((a, b) => sectionOrder.get(b.comment.sectionId) - sectionOrder.get(a.comment.sectionId) || b.comment.start - a.comment.start);
    for (const item of valid) {
      const mark = document.createElement('mark');
      mark.className = 'review-mark';
      try {
        mark.append(item.range.extractContents());
        item.range.insertNode(mark);
      } catch {
        // Leave the saved note available for export if this browser cannot wrap the range.
      }
    }
    savedRanges = new Map(comments.map(comment => [comment.id, findCommentRange(comment)]).filter(([, range]) => range));
  }

  function positionMarkers() {
    document.querySelectorAll('.review-marker').forEach(marker => {
      const comment = comments.find(item => item.id === marker.dataset.commentId);
      if (!comment) return;
      let left;
      let top;
      if (isAreaComment(comment)) {
        const section = sections.find(item => item.dataset.reviewId === comment.sectionId);
        if (!section) return;
        const rect = section.getBoundingClientRect();
        left = rect.left + rect.width * comment.xRatio;
        top = rect.top + rect.height * comment.yRatio;
      } else {
        const range = savedRanges.get(comment.id);
        if (!range) return;
        const rect = range.getBoundingClientRect();
        left = rect.right + 9;
        top = rect.bottom + 2;
      }
      left = Math.min(window.innerWidth - 18, Math.max(18, left));
      top = Math.min(window.innerHeight - 18, Math.max(18, top));
      marker.style.left = `${left}px`;
      marker.style.top = `${top}px`;
    });
  }

  function renderMarkers() {
    document.querySelectorAll('.review-marker').forEach(marker => marker.remove());
    for (const comment of comments) {
      const areaComment = isAreaComment(comment) && sections.some(item => item.dataset.reviewId === comment.sectionId);
      if (!savedRanges.has(comment.id) && !areaComment) continue;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'review-marker';
      marker.dataset.commentId = comment.id;
      marker.setAttribute('aria-label', isAreaComment(comment)
        ? `Abrir comentário sobre a área: ${comment.sectionTitle}`
        : `Abrir comentário: ${comment.quote.slice(0, 90)}`);
      marker.title = 'Abrir comentário';
      marker.textContent = '•';
      marker.addEventListener('click', () => {
        setToolbarOpen(true);
        setReviewMode(true);
        const range = savedRanges.get(comment.id) || null;
        const markerRect = marker.getBoundingClientRect();
        openPopover({
          sectionId: comment.sectionId,
          sectionTitle: comment.sectionTitle,
          scope: comment.scope,
          start: comment.start,
          end: comment.start + comment.quote.length,
          quote: comment.quote,
          prefix: comment.prefix,
          suffix: comment.suffix,
          xRatio: comment.xRatio,
          yRatio: comment.yRatio
        }, range, comment, { x: markerRect.left, y: markerRect.top });
      });
      document.body.append(marker);
    }
    positionMarkers();
  }

  function updateCounts() {
    countLabel.textContent = String(comments.length);
    exportButton.disabled = comments.length === 0;
    clearButton.disabled = comments.length === 0;
  }

  function setToolbarOpen(open) {
    toolbar.hidden = !open;
    launchButton.setAttribute('aria-expanded', String(open));
    if (!open) {
      setReviewMode(false);
      closePopover();
    }
  }

  function setToolbarCollapsed(collapsed) {
    toolbar.classList.toggle('is-collapsed', collapsed);
    minimizeButton.textContent = collapsed ? '+' : '−';
    minimizeButton.setAttribute('aria-expanded', String(!collapsed));
    minimizeButton.setAttribute('aria-label', collapsed ? 'Expandir controles de revisão' : 'Minimizar controles de revisão');
  }

  function setReviewMode(active) {
    reviewMode = active;
    document.body.classList.toggle('review-mode', active);
    helpText.textContent = active
      ? 'A revisão já está ativa. Selecione qualquer texto ou clique numa área sem texto para comentar essa faixa ou região.'
      : 'Toque no botão laranja “Anotar um trecho”. Depois, selecione texto ou clique numa área sem texto para comentar.';
  }

  function openPopover(anchor, range, comment = null, point = null) {
    currentAnchor = anchor;
    currentCommentId = comment?.id || null;
    setToolbarCollapsed(true);
    const areaComment = isAreaComment(anchor);
    popoverKicker.textContent = anchor.scope === 'section'
      ? 'COMENTÁRIO SOBRE A FAIXA'
      : areaComment ? 'COMENTÁRIO SOBRE A ÁREA' : 'COMENTÁRIO SOBRE O TRECHO';
    quoteLabel.textContent = areaComment
      ? `${anchor.scope === 'section' ? 'Faixa inteira' : 'Área inteira'} · ${anchor.sectionTitle}`
      : `“${anchor.quote}”`;
    noteField.value = comment?.text || '';
    deleteButton.hidden = !comment;
    popover.hidden = false;
    requestAnimationFrame(() => {
      const rect = range?.getBoundingClientRect();
      const box = popover.getBoundingClientRect();
      let left = rect ? rect.left : point?.x ?? 16;
      left = Math.min(window.innerWidth - box.width - 8, Math.max(8, left));
      let top = rect ? rect.bottom + 10 : point ? point.y + 10 : 80;
      if (top + box.height > window.innerHeight - 8) top = (rect?.top ?? point?.y ?? 80) - box.height - 10;
      top = Math.min(window.innerHeight - box.height - 8, Math.max(8, top));
      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
      noteField.focus({ preventScroll: true });
    });
  }

  function closePopover() {
    popover.hidden = true;
    form.reset();
    currentAnchor = null;
    currentCommentId = null;
  }

  function topSection(node) {
    const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    return element?.closest('main > section, main > .format-strip, header, footer, main') || null;
  }

  function anchorFromSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    const section = topSection(range.startContainer);
    if (!section || section !== topSection(range.endContainer)) return null;
    const raw = range.toString();
    const selectedText = raw.trim();
    if (!selectedText || selectedText.length > 1200) return null;
    const leading = raw.length - raw.trimStart().length;
    const trailing = raw.length - raw.trimEnd().length;
    const startOffset = offsetFor(section, range.startContainer, range.startOffset);
    const endOffset = offsetFor(section, range.endContainer, range.endOffset);
    if (startOffset === null || endOffset === null) return null;
    const start = startOffset + leading;
    const end = endOffset - trailing;
    const fullText = sectionText(section);
    const cleanRange = rangeAt(section, start, end);
    if (!cleanRange) return null;
    const quote = fullText.slice(start, end);
    if (quote.replace(/\s+/g, ' ').trim() !== raw.replace(/\s+/g, ' ').trim()) return null;
    return {
      sectionId: section.dataset.reviewId,
      sectionTitle: section.dataset.reviewTitle,
      start,
      end,
      quote,
      prefix: fullText.slice(Math.max(0, start - 48), start),
      suffix: fullText.slice(end, end + 48)
    };
  }

  function handleSelection(event) {
    if (!reviewMode || event.target?.closest?.('.review-toolbar, .review-launch, .review-popover, .review-marker')) return;
    window.setTimeout(() => {
      const anchor = anchorFromSelection();
      if (!anchor) return;
      const section = sections.find(item => item.dataset.reviewId === anchor.sectionId);
      const range = rangeAt(section, anchor.start, anchor.end);
      if (range) openPopover(anchor, range);
    }, 0);
  }

  function textAtPoint(x, y) {
    let node = null;
    let offset = 0;
    if (document.caretRangeFromPoint) {
      const caret = document.caretRangeFromPoint(x, y);
      node = caret?.startContainer || null;
      offset = caret?.startOffset || 0;
    } else if (document.caretPositionFromPoint) {
      const caret = document.caretPositionFromPoint(x, y);
      node = caret?.offsetNode || null;
      offset = caret?.offset || 0;
    }
    if (!node || node.nodeType !== Node.TEXT_NODE) return false;
    for (const index of [Math.min(offset, node.length - 1), Math.max(0, offset - 1)]) {
      if (index < 0 || index >= node.length) continue;
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      for (const rect of range.getClientRects()) {
        if (x >= rect.left - 1 && x <= rect.right + 1 && y >= rect.top - 1 && y <= rect.bottom + 1) return true;
      }
    }
    return false;
  }

  function handleAreaClick(event) {
    if (!reviewMode) return;
    if (event.target?.closest?.('.review-toolbar, .review-launch, .review-popover, .review-marker, .review-welcome-overlay, a, button, input, textarea, select, label')) return;
    const section = topSection(event.target);
    if (!section || textAtPoint(event.clientX, event.clientY)) return;
    if (!document.caretRangeFromPoint && !document.caretPositionFromPoint
      && event.target?.closest?.('p, h1, h2, h3, h4, h5, h6, li, span, em, strong')) return;
    const rect = section.getBoundingClientRect();
    const anchor = {
      sectionId: section.dataset.reviewId,
      sectionTitle: section.dataset.reviewTitle,
      scope: section.tagName === 'SECTION' ? 'section' : 'area',
      start: 0,
      end: 0,
      quote: section.dataset.reviewTitle,
      prefix: '',
      suffix: '',
      xRatio: Math.max(0.04, Math.min(0.96, (event.clientX - rect.left) / rect.width)),
      yRatio: Math.max(0.04, Math.min(0.96, (event.clientY - rect.top) / rect.height))
    };
    openPopover(anchor, null, null, { x: event.clientX, y: event.clientY });
  }

  function exportComments() {
    const report = [
      'REVISÃO DA LANDING PAGE · GESTÃO ESTRATÉGICA EVOLUCIONÁRIA',
      `Data da exportação: ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}`,
      `Página: ${location.origin}${location.pathname}`,
      '',
      ...comments.flatMap((comment, index) => [
        `${index + 1}. ${comment.sectionTitle}`,
        comment.scope === 'section'
          ? 'Escopo: comentário sobre a faixa inteira'
          : comment.scope === 'area'
            ? 'Escopo: comentário sobre a área inteira'
            : `Trecho marcado: “${comment.quote}”`,
        ...(isAreaComment(comment)
          ? [`Ponto relativo à área: horizontal ${Math.round(comment.xRatio * 100)}%, vertical ${Math.round(comment.yRatio * 100)}%`]
          : []),
        `Seção: ${location.origin}${location.pathname}#${comment.sectionId}`,
        `Comentário: ${comment.text}`,
        ''
      ])
    ].join('\n');
    const blob = new Blob(['\uFEFF', report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comentarios-revisao-gee-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.append(link);
    link.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 1000);
  }

  prepareSections();
  renderHighlights();
  renderMarkers();
  updateCounts();
  setWelcomeOpen(true);

  welcomeStartButton.addEventListener('click', () => setWelcomeOpen(false));
  welcomeDialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setWelcomeOpen(false);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      welcomeStartButton.focus();
    }
  });
  launchButton.addEventListener('click', () => {
    setToolbarOpen(true);
    setReviewMode(true);
  });
  exportButton.addEventListener('click', exportComments);
  clearButton.addEventListener('click', () => {
    if (!window.confirm('Excluir todas as anotações salvas neste navegador?')) return;
    comments = [];
    saveComments();
    renderHighlights();
    renderMarkers();
    updateCounts();
    closePopover();
  });
  closeButton.addEventListener('click', () => setToolbarOpen(false));
  minimizeButton.addEventListener('click', () => {
    const collapsed = toolbar.classList.toggle('is-collapsed');
    setToolbarCollapsed(collapsed);
  });
  cancelButton.addEventListener('click', closePopover);
  closePopoverButton.addEventListener('click', closePopover);
  deleteButton.addEventListener('click', () => {
    comments = comments.filter(comment => comment.id !== currentCommentId);
    saveComments();
    renderHighlights();
    renderMarkers();
    updateCounts();
    closePopover();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = noteField.value.trim();
    if (!text || !currentAnchor) return;
    const now = new Date().toISOString();
    if (currentCommentId) {
      comments = comments.map(comment => comment.id === currentCommentId
        ? { ...comment, text, updatedAt: now }
        : comment);
    } else {
      comments.push({
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ...currentAnchor,
        text,
        createdAt: now
      });
    }
    saveComments();
    window.getSelection()?.removeAllRanges();
    renderHighlights();
    renderMarkers();
    updateCounts();
    closePopover();
  });

  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('touchend', handleSelection, { passive: true });
  document.addEventListener('click', handleAreaClick);
  document.addEventListener('keyup', event => {
    if (event.key === 'Shift' || event.key.startsWith('Arrow')) handleSelection(event);
  });
  window.addEventListener('scroll', positionMarkers, true);
  window.addEventListener('resize', positionMarkers);
})();
