// ==================== GLOBAL STATE ====================

const state = {
    files: [],
    currentPreviewIndex: null,
    currentPageIndex: 0,
    mergedPDF: null,
    isDragging: false,
};

// ==================== DOM ELEMENTS ====================

const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    browseBtn: document.getElementById('browseBtn'),
    filesList: document.getElementById('filesList'),
    fileCount: document.getElementById('fileCount'),
    uploadProgress: document.getElementById('uploadProgress'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    mergeBtn: document.getElementById('mergeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    
    // Inline preview elements
    previewPlaceholder: document.getElementById('previewPlaceholder'),
    previewViewer: document.getElementById('previewViewer'),
    previewFileName: document.getElementById('previewFileName'),
    previewCanvas: document.getElementById('previewCanvas'),
    previewPrevBtn: document.getElementById('previewPrevBtn'),
    previewNextBtn: document.getElementById('previewNextBtn'),
    previewPageIndicator: document.getElementById('previewPageIndicator'),
    closePreviewBtn: document.getElementById('closePreviewBtn'),
    
    // Modal preview elements
    previewModal: document.getElementById('previewModal'),
    previewContainer: document.getElementById('previewContainer'),
    previewTitle: document.getElementById('previewTitle'),
    closeModal: document.getElementById('closeModal'),
    expandToInlineBtn: document.getElementById('expandToInlineBtn'),
    modalOverlay: document.getElementById('modalOverlay'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageIndicator: document.getElementById('pageIndicator'),
    
    downloadSection: document.getElementById('downloadSection'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadName: document.getElementById('downloadName'),
    downloadFileName: document.getElementById('downloadFileName'),
    downloadFileSize: document.getElementById('downloadFileSize'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    loadingText: document.getElementById('loadingText'),
    toastContainer: document.getElementById('toastContainer'),
};

// ==================== PDF.JS SETUP ====================

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ==================== INITIALIZATION ====================

function init() {
    setupEventListeners();
    setupPDFLibrary();
}

function setupEventListeners() {
    // Drop zone events
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.fileInput.click();
    });

    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);

    // File input
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Inline preview events
    elements.previewPrevBtn.addEventListener('click', previewPreviousPage);
    elements.previewNextBtn.addEventListener('click', previewNextPage);
    elements.closePreviewBtn.addEventListener('click', closeInlinePreview);

    // Disable preview buttons by default
    elements.previewPrevBtn.disabled = true;
    elements.previewNextBtn.disabled = true;

    // Modal events
    elements.closeModal.addEventListener('click', closeModal);
    elements.expandToInlineBtn.addEventListener('click', expandModalToInline);
    elements.modalOverlay.addEventListener('click', closeModal);
    elements.prevPageBtn.addEventListener('click', previousPage);
    elements.nextPageBtn.addEventListener('click', nextPage);

    // Disable modal navigation buttons by default
    elements.prevPageBtn.disabled = true;
    elements.nextPageBtn.disabled = true;

    // Action buttons
    elements.mergeBtn.addEventListener('click', handleMerge);
    elements.clearBtn.addEventListener('click', handleClearAll);
    elements.downloadBtn.addEventListener('click', handleDownload);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.currentPreviewIndex !== null) {
            closeModal();
        }
    });
}

function setupPDFLibrary() {
    // PDF library is loaded from CDN
    console.log('PDF libraries loaded successfully');
}

// ==================== FILE UPLOAD HANDLING ====================

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    elements.dropZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
    // Reset file input
    elements.fileInput.value = '';
}

async function processFiles(files) {
    const pdfFiles = files.filter((file) => file.type === 'application/pdf');

    if (files.length !== pdfFiles.length) {
        showToast(`${files.length - pdfFiles.length} file(s) were skipped. Only PDF files are supported.`, 'warning');
    }

    if (pdfFiles.length === 0) {
        showToast('No PDF files found. Please select PDF files.', 'error');
        return;
    }

    // Show upload progress
    elements.uploadProgress.style.display = 'block';
    let uploaded = 0;

    for (const file of pdfFiles) {
        try {
            // Validate file size (max 100MB per file)
            if (file.size > 100 * 1024 * 1024) {
                showToast(`File "${file.name}" is too large (max 100MB).`, 'error');
                continue;
            }

            // Check for duplicate files
            if (state.files.some((f) => f.name === file.name && f.size === file.size)) {
                showToast(`File "${file.name}" is already added.`, 'warning');
                continue;
            }

            // Validate PDF by reading fresh from file
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const pageCount = pdf.numPages;

                // Add file to state - store only the File object
                // We'll read fresh each time to avoid ArrayBuffer detachment
                state.files.push({
                    name: file.name,
                    size: file.size,
                    file: file, // Keep only the original File object
                    pageCount: pageCount,
                    id: `${Date.now()}-${Math.random()}`,
                });

                uploaded++;
            } catch (err) {
                showToast(`File "${file.name}" is not a valid PDF.`, 'error');
                console.error('Invalid PDF:', err);
            }
        } catch (err) {
            showToast(`Error processing file "${file.name}".`, 'error');
            console.error('File processing error:', err);
        }

        // Update progress
        const progress = ((uploaded + 1) / pdfFiles.length) * 100;
        elements.progressFill.style.width = progress + '%';
        elements.progressText.textContent = `Uploading ${uploaded + 1} of ${pdfFiles.length}...`;
    }

    // Hide upload progress
    setTimeout(() => {
        elements.uploadProgress.style.display = 'none';
        elements.progressFill.style.width = '0%';
    }, 500);

    // Update UI
    updateFilesList();
    updateMergeButton();

    if (uploaded > 0) {
        showToast(`✓ Successfully added ${uploaded} PDF file(s).`, 'success');
    }
}

// ==================== FILE MANAGEMENT ====================

function updateFilesList() {
    elements.fileCount.textContent = state.files.length;

    if (state.files.length === 0) {
        elements.filesList.innerHTML = '<p class="empty-state">No PDFs uploaded yet</p>';
        return;
    }

    elements.filesList.innerHTML = state.files
        .map((file, index) => createFileItemHTML(file, index))
        .join('');

    // Attach event listeners to file items
    attachFileItemListeners();
}

function createFileItemHTML(file, index) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    return `
        <div class="file-item" draggable="true" data-id="${file.id}" data-index="${index}">
            <div class="file-index">${index + 1}</div>
            <div class="file-thumbnail">
                <canvas id="thumbnail-${file.id}"></canvas>
            </div>
            <div class="file-info">
                <div class="file-name">${escapeHtml(file.name)}</div>
                <div class="file-meta">
                    <span>📄 ${file.pageCount} page${file.pageCount !== 1 ? 's' : ''}</span>
                    <span>💾 ${fileSizeMB} MB</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-btn preview-btn" data-id="${file.id}" title="Preview" aria-label="Preview ${escapeHtml(file.name)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
                <button class="file-btn move-up-btn" data-id="${file.id}" title="Move Up" aria-label="Move up" ${index === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </button>
                <button class="file-btn move-down-btn" data-id="${file.id}" title="Move Down" aria-label="Move down" ${
        index === state.files.length - 1 ? 'disabled' : ''
    }>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <button class="file-btn remove-btn" data-id="${file.id}" title="Remove" aria-label="Remove ${escapeHtml(file.name)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <path d="M12 3v18"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function attachFileItemListeners() {
    // Drag and drop reorder
    const fileItems = document.querySelectorAll('.file-item');

    fileItems.forEach((item) => {
        item.addEventListener('dragstart', handleItemDragStart);
        item.addEventListener('dragend', handleItemDragEnd);
        item.addEventListener('dragover', handleItemDragOver);
        item.addEventListener('drop', handleItemDrop);
    });

    // Use event delegation for buttons to avoid duplicate listeners
    elements.filesList.removeEventListener('click', handleFileListClick);
    elements.filesList.addEventListener('click', handleFileListClick);

    // Generate thumbnails
    fileItems.forEach((item, index) => {
        generateThumbnail(state.files[index]);
    });
}

// Single event handler for all button clicks in the file list
function handleFileListClick(e) {
    e.stopPropagation();
    const btn = e.target.closest('.file-btn');
    if (!btn) return;

    const fileId = btn.dataset.id;

    if (btn.classList.contains('preview-btn')) {
        openPreview(fileId);
    } else if (btn.classList.contains('move-up-btn')) {
        moveFileUp(fileId);
    } else if (btn.classList.contains('move-down-btn')) {
        moveFileDown(fileId);
    } else if (btn.classList.contains('remove-btn')) {
        removeFile(fileId);
    }
}

let draggedItem = null;
let draggedFileId = null;

function handleItemDragStart(e) {
    draggedItem = this;
    draggedFileId = this.dataset.id;
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');
}

function handleItemDragEnd(e) {
    if (draggedItem) {
        draggedItem.style.opacity = '1';
        draggedItem.classList.remove('dragging');
    }
    draggedItem = null;
    draggedFileId = null;
}

function handleItemDragOver(e) {
    if (!draggedItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const afterElement = getDragAfterElement(e.clientY);
    const container = elements.filesList;

    if (afterElement == null) {
        container.appendChild(draggedItem);
    } else {
        container.insertBefore(draggedItem, afterElement);
    }
}

function handleItemDrop(e) {
    e.preventDefault();
    if (!draggedItem || !draggedFileId) return;

    // Sync state.files with the new DOM order
    syncFileOrderFromDOM();
    
    // Update UI and ensure merge button is ready
    updateMergeButton();
    showToast('Order updated', 'info');
}

function syncFileOrderFromDOM() {
    // Get the current DOM order of file items
    const fileItems = document.querySelectorAll('.file-item');
    const newOrder = [];

    fileItems.forEach((item) => {
        const fileId = item.dataset.id;
        // Find the file in state with matching ID
        const file = state.files.find((f) => f.id === fileId);
        if (file) {
            newOrder.push(file);
        }
    });

    // Update state with new order if we got all files
    if (newOrder.length === state.files.length) {
        state.files = newOrder;
    } else {
        // Fallback: if IDs don't match, re-render to fix
        updateFilesList();
    }
}

function getDragAfterElement(y) {
    const draggableElements = [...document.querySelectorAll('.file-item:not(.dragging)')];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}

function moveFileUp(fileId) {
    const index = state.files.findIndex((f) => f.id === fileId);
    if (index > 0) {
        [state.files[index], state.files[index - 1]] = [state.files[index - 1], state.files[index]];
        updateFilesList();
        updateMergeButton();
    }
}

function moveFileDown(fileId) {
    const index = state.files.findIndex((f) => f.id === fileId);
    if (index < state.files.length - 1) {
        [state.files[index], state.files[index + 1]] = [state.files[index + 1], state.files[index]];
        updateFilesList();
        updateMergeButton();
    }
}

function removeFile(fileId) {
    state.files = state.files.filter((f) => f.id !== fileId);
    updateFilesList();
    updateMergeButton();

    // Close preview if the removed file was being previewed
    if (state.currentPreviewIndex !== null) {
        closeInlinePreview();
        closeModal();
    }

    showToast('PDF removed', 'info');
}

function handleClearAll() {
    if (state.files.length === 0) return;

    const confirmed = confirm('Are you sure you want to remove all PDFs? This action cannot be undone.');
    if (confirmed) {
        state.files = [];
        state.mergedPDF = null;
        updateFilesList();
        updateMergeButton();
        hideDownloadSection();
        closeModal();
        closeInlinePreview();
        showToast('All files cleared', 'info');
    }
}

async function generateThumbnail(file) {
    try {
        // Read fresh from File object to avoid detachment
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const scale = 1;
        const viewport = page.getViewport({ scale });
        const canvas = document.getElementById(`thumbnail-${file.id}`);

        if (!canvas) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
    } catch (err) {
        console.error('Error generating thumbnail:', err);
    }
}

// ==================== PREVIEW FUNCTIONALITY ====================

async function openPreview(fileId) {
    const index = state.files.findIndex((f) => f.id === fileId);
    if (index === -1) return;

    state.currentPreviewIndex = index;
    state.currentPageIndex = 0;

    const file = state.files[index];
    elements.previewTitle.textContent = escapeHtml(file.name);

    elements.previewModal.style.display = 'flex';
    
    // Enable modal navigation buttons
    elements.prevPageBtn.disabled = false;
    elements.nextPageBtn.disabled = false;
    
    await renderPreviewPage();
    updatePageNavigation();
}

async function renderPreviewPage() {
    // Validate state before rendering
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        console.error('No preview file selected');
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        elements.previewContainer.innerHTML = '<p>File no longer available</p>';
        return;
    }

    // Defensive check: ensure file.file exists
    if (!file.file) {
        console.error('File data is missing');
        elements.previewContainer.innerHTML = '<p>Error: File data is missing</p>';
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count');
        elements.previewContainer.innerHTML = '<p>Error: Invalid PDF</p>';
        return;
    }

    // Validate current page index
    if (state.currentPageIndex >= file.pageCount) {
        state.currentPageIndex = file.pageCount - 1;
    }

    try {
        // Read fresh from File object to avoid detachment
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(state.currentPageIndex + 1);

        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;

        elements.previewContainer.innerHTML = '';
        elements.previewContainer.appendChild(canvas);
    } catch (err) {
        console.error('Error rendering preview page:', err);
        elements.previewContainer.innerHTML = '<p>Error loading page. The PDF may be corrupted.</p>';
    }
}

function updatePageNavigation() {
    // Validate state before updating
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count for file');
        return;
    }

    const pageNum = state.currentPageIndex + 1;
    const totalPages = file.pageCount;

    elements.pageIndicator.textContent = `Page ${pageNum} of ${totalPages}`;
    elements.prevPageBtn.disabled = state.currentPageIndex === 0;
    elements.nextPageBtn.disabled = state.currentPageIndex === totalPages - 1;
}

async function previousPage() {
    // Validate state before navigating
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        console.error('No preview file selected');
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count for file');
        return;
    }

    if (state.currentPageIndex > 0) {
        state.currentPageIndex--;
        await renderPreviewPage();
        updatePageNavigation();
    }
}

async function nextPage() {
    // Validate state before navigating
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        console.error('No preview file selected');
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count for file');
        return;
    }

    if (state.currentPageIndex < file.pageCount - 1) {
        state.currentPageIndex++;
        await renderPreviewPage();
        updatePageNavigation();
    }
}

function closeModal() {
    elements.previewModal.style.display = 'none';
    state.currentPreviewIndex = null;
    state.currentPageIndex = 0;
    
    // Disable modal navigation buttons
    elements.prevPageBtn.disabled = true;
    elements.nextPageBtn.disabled = true;
}

// Expand modal preview to inline preview panel
async function expandModalToInline() {
    if (state.currentPreviewIndex === null) return;

    const file = state.files[state.currentPreviewIndex];
    
    // Hide the modal WITHOUT clearing state (preserve currentPreviewIndex)
    elements.previewModal.style.display = 'none';

    // Show inline preview
    elements.previewFileName.textContent = escapeHtml(file.name);
    elements.previewPlaceholder.style.display = 'none';
    elements.previewViewer.style.display = 'flex';

    // Enable inline navigation buttons
    elements.previewPrevBtn.disabled = false;
    elements.previewNextBtn.disabled = false;

    // Render the same page in inline preview
    await renderInlinePreviewPage();
    updateInlinePageNavigation();
    
    showToast('Preview expanded to panel', 'info');
}

// ==================== INLINE PREVIEW FUNCTIONALITY ====================

async function renderInlinePreviewPage() {
    // Validate state before rendering
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        console.error('No preview file selected');
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        elements.previewCanvas.innerHTML = '<p>File no longer available</p>';
        return;
    }

    // Defensive check: ensure file.file exists
    if (!file.file) {
        console.error('File data is missing');
        elements.previewCanvas.innerHTML = '<p>Error: File data is missing</p>';
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count');
        elements.previewCanvas.innerHTML = '<p>Error: Invalid PDF</p>';
        return;
    }

    // Validate current page index
    if (state.currentPageIndex >= file.pageCount) {
        state.currentPageIndex = file.pageCount - 1;
    }

    try {
        // Read fresh from File object to avoid detachment
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(state.currentPageIndex + 1);

        const scale = 1.2;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;

        elements.previewCanvas.innerHTML = '';
        elements.previewCanvas.appendChild(canvas);
    } catch (err) {
        console.error('Error rendering inline preview page:', err);
        elements.previewCanvas.innerHTML = '<p>Error loading page. The PDF may be corrupted.</p>';
    }
}

function updateInlinePageNavigation() {
    // Validate state before updating
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count for file');
        return;
    }

    const pageNum = state.currentPageIndex + 1;
    const totalPages = file.pageCount;

    elements.previewPageIndicator.textContent = `Page ${pageNum} of ${totalPages}`;
    elements.previewPrevBtn.disabled = state.currentPageIndex === 0;
    elements.previewNextBtn.disabled = state.currentPageIndex === totalPages - 1;
}

async function openInlinePreview(fileId) {
    const index = state.files.findIndex((f) => f.id === fileId);
    if (index === -1) return;

    state.currentPreviewIndex = index;
    state.currentPageIndex = 0;

    const file = state.files[index];
    elements.previewFileName.textContent = escapeHtml(file.name);

    // Show inline preview, hide placeholder
    elements.previewPlaceholder.style.display = 'none';
    elements.previewViewer.style.display = 'flex';

    // Enable navigation buttons
    elements.previewPrevBtn.disabled = false;
    elements.previewNextBtn.disabled = false;

    await renderInlinePreviewPage();
    updateInlinePageNavigation();
}

async function previewPreviousPage() {
    // Validate state before navigating
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        console.error('No preview file selected');
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count for file');
        return;
    }

    if (state.currentPageIndex > 0) {
        state.currentPageIndex--;
        await renderInlinePreviewPage();
        updateInlinePageNavigation();
    }
}

async function previewNextPage() {
    // Validate state before navigating
    if (state.currentPreviewIndex === null || state.currentPreviewIndex === undefined) {
        console.error('No preview file selected');
        return;
    }

    const file = state.files[state.currentPreviewIndex];
    
    // Defensive check: ensure file exists
    if (!file) {
        console.error('File not found in state');
        return;
    }

    // Defensive check: ensure pageCount is valid
    if (!file.pageCount || file.pageCount < 1) {
        console.error('Invalid page count for file');
        return;
    }

    if (state.currentPageIndex < file.pageCount - 1) {
        state.currentPageIndex++;
        await renderInlinePreviewPage();
        updateInlinePageNavigation();
    }
}

function closeInlinePreview() {
    elements.previewPlaceholder.style.display = 'flex';
    elements.previewViewer.style.display = 'none';
    state.currentPreviewIndex = null;
    state.currentPageIndex = 0;
    
    // Disable navigation buttons
    elements.previewPrevBtn.disabled = true;
    elements.previewNextBtn.disabled = true;
}

// ==================== MERGE FUNCTIONALITY ====================

async function handleMerge() {
    if (state.files.length < 2) {
        showToast('Please upload at least 2 PDFs to merge.', 'error');
        return;
    }

    try {
        showLoadingSpinner('Merging PDFs...');
        elements.mergeBtn.disabled = true;

        const { PDFDocument } = PDFLib;

        // Create new PDF document
        const mergedPdf = await PDFDocument.create();

        // Add all files to merged PDF
        for (let i = 0; i < state.files.length; i++) {
            const file = state.files[i];

            try {
                // Read fresh from File object to avoid detachment
                const arrayBuffer = await file.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                pages.forEach((page) => {
                    mergedPdf.addPage(page);
                });

                elements.loadingText.textContent = `Merging PDFs... (${i + 1}/${state.files.length})`;
            } catch (err) {
                showToast(`Error processing "${file.name}". Skipping this file.`, 'error');
                console.error('Error processing file:', err);
            }
        }

        // Save merged PDF
        const pdfBytes = await mergedPdf.save();
        state.mergedPDF = pdfBytes;

        // Hide spinner
        hideLoadingSpinner();

        // Show download section
        showDownloadSection();
        showToast('✓ PDFs merged successfully!', 'success');
    } catch (err) {
        hideLoadingSpinner();
        elements.mergeBtn.disabled = false;
        showToast('Error merging PDFs. Please try again.', 'error');
        console.error('Merge error:', err);
    }

    elements.mergeBtn.disabled = false;
}

// ==================== DOWNLOAD FUNCTIONALITY ====================

function showDownloadSection() {
    if (!state.mergedPDF) return;

    const fileSize = (state.mergedPDF.length / (1024 * 1024)).toFixed(2);
    const fileName = generateMergedFileName();

    elements.downloadFileName.innerHTML = `<strong>File name:</strong> ${escapeHtml(fileName)}`;
    elements.downloadFileSize.innerHTML = `<strong>File size:</strong> ${fileSize} MB`;
    elements.downloadName.value = fileName;
    elements.downloadSection.style.display = 'flex';

    // Scroll to download section
    elements.downloadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideDownloadSection() {
    elements.downloadSection.style.display = 'none';
    state.mergedPDF = null;
}

function generateMergedFileName() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `merged-${dateStr}-${timeStr}.pdf`;
}

function handleDownload() {
    if (!state.mergedPDF) {
        showToast('No merged PDF available. Merge files first.', 'error');
        return;
    }

    let fileName = elements.downloadName.value.trim();

    if (!fileName) {
        fileName = generateMergedFileName();
    }

    // Ensure .pdf extension
    if (!fileName.toLowerCase().endsWith('.pdf')) {
        fileName += '.pdf';
    }

    // Download
    const blob = new Blob([state.mergedPDF], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('✓ PDF downloaded successfully!', 'success');
}

// ==================== UI UTILITIES ====================

function updateMergeButton() {
    elements.mergeBtn.disabled = state.files.length < 2;
    elements.clearBtn.disabled = state.files.length === 0;
}

function showLoadingSpinner(text = 'Loading...') {
    elements.loadingText.textContent = text;
    elements.loadingSpinner.style.display = 'flex';
}

function hideLoadingSpinner() {
    elements.loadingSpinner.style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <div class="toast-message">${escapeHtml(message)}</div>
        <button class="toast-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    elements.toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ==================== INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', init);

// Handle unload warning if files are present
window.addEventListener('beforeunload', (e) => {
    if (state.files.length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});
