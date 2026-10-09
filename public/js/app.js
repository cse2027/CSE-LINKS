/**
 * Certificate Upload - Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  
  let currentFile = null;
  let rosterData = {
    stats: { total: 68, uploaded: 0, pending: 68, percentage: 0 },
    submissions: [],
    pendingList: []
  };

  const EXCLUDED_23 = ['23BQ1A0526', '23BQ1A0529', '23BQ1A0554'];

  // DOM Elements
  const form = document.getElementById('certificateForm');
  const nameInput = document.getElementById('studentName');
  const rollInput = document.getElementById('rollNo');
  const courseSelect = document.getElementById('courseSelect');
  const courseNameInput = document.getElementById('courseName');
  const fileInput = document.getElementById('fileInput');
  const dropzone = document.getElementById('dropzone');

  const dropzoneEmpty = document.getElementById('dropzoneEmpty');
  const filePreviewCard = document.getElementById('filePreviewCard');
  const previewFileName = document.getElementById('previewFileName');
  const previewFileSize = document.getElementById('previewFileSize');
  const btnRemoveFile = document.getElementById('btnRemoveFile');

  const rollFeedback = document.getElementById('rollFeedback');
  const rollWrapper = rollInput.closest('.input-wrapper');

  const requiredNamePattern = document.getElementById('requiredNamePattern');
  const namingStatusBox = document.getElementById('namingStatusBox');
  const namingStatusText = document.getElementById('namingStatusText');
  const namingIcon = document.getElementById('namingIcon');
  const btnSubmit = document.getElementById('btnSubmit');

  // Stats Header Elements
  const statUploaded = document.getElementById('statUploaded');
  const statPending = document.getElementById('statPending');
  const statTotal = document.getElementById('statTotal');

  // Admin Modal Elements
  const openAdminBtn = document.getElementById('openAdminBtn');
  const adminAuthModal = document.getElementById('adminAuthModal');
  const closeAdminAuthBtn = document.getElementById('closeAdminAuthBtn');
  const adminAuthForm = document.getElementById('adminAuthForm');
  const adminUsername = document.getElementById('adminUsername');
  const adminPassword = document.getElementById('adminPassword');
  const adminAuthFeedback = document.getElementById('adminAuthFeedback');

  const adminDashboardModal = document.getElementById('adminDashboardModal');
  const closeAdminDashBtn = document.getElementById('closeAdminDashBtn');
  const btnLogoutAdmin = document.getElementById('btnLogoutAdmin');
  const btnExportCSV = document.getElementById('btnExportCSV');

  const adminProgressBadge = document.getElementById('adminProgressBadge');
  const adminProgressBarFill = document.getElementById('adminProgressBarFill');
  const adminMetricUploaded = document.getElementById('adminMetricUploaded');
  const adminMetricPending = document.getElementById('adminMetricPending');
  const adminMetricTotal = document.getElementById('adminMetricTotal');

  const countPendingBadge = document.getElementById('countPendingBadge');
  const countUploadedBadge = document.getElementById('countUploadedBadge');

  const adminSearchInput = document.getElementById('adminSearchInput');
  const pendingTableBody = document.getElementById('pendingTableBody');
  const uploadedTableBody = document.getElementById('uploadedTableBody');

  const subtabBtns = document.querySelectorAll('.sub-tab-btn');
  const subtabPanes = document.querySelectorAll('.subtab-pane');

  // ----------------------------------------------------
  // 1. Initial Live Status Fetch
  // ----------------------------------------------------
  fetchLiveStatus();

  async function fetchLiveStatus() {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('Network error');
      rosterData = await res.json();
      updateLiveCounts();
    } catch (err) {
      console.error('Fetch status error:', err);
    }
  }

  function updateLiveCounts() {
    const { total, uploaded, pending, percentage } = rosterData.stats;

    // Update Header Pill
    if (statUploaded) statUploaded.textContent = uploaded;
    if (statPending) statPending.textContent = pending;
    if (statTotal) statTotal.textContent = total;

    // Update Admin Metrics
    if (adminProgressBadge) adminProgressBadge.textContent = `${percentage}%`;
    if (adminProgressBarFill) adminProgressBarFill.style.width = `${percentage}%`;
    if (adminMetricUploaded) adminMetricUploaded.textContent = uploaded;
    if (adminMetricPending) adminMetricPending.textContent = pending;
    if (adminMetricTotal) adminMetricTotal.textContent = total;
    if (countPendingBadge) countPendingBadge.textContent = pending;
    if (countUploadedBadge) countUploadedBadge.textContent = uploaded;

    renderAdminTables();
    if (rollInput && rollInput.value) {
      validateRollNumber(rollInput.value.toUpperCase().trim());
    }
  }

  // ----------------------------------------------------
  // 2. Form Input Formatting & Real-time Validation
  // ----------------------------------------------------
  rollInput.addEventListener('input', () => {
    let val = rollInput.value.toUpperCase().trim();
    rollInput.value = val;
    validateRollNumber(val);
    updateFileNamingRequirement();
  });

  courseSelect.addEventListener('change', () => {
    updateFileNamingRequirement();
  });

  if (courseNameInput) {
    courseNameInput.addEventListener('input', () => {
      updateFileNamingRequirement();
    });
  }

  function validateRollNumber(roll) {
    const iconSuccess = rollWrapper.querySelector('.icon-success');
    const iconError = rollWrapper.querySelector('.icon-error');

    iconSuccess.style.display = 'none';
    iconError.style.display = 'none';

    if (!roll) {
      if (rollFeedback) rollFeedback.style.display = 'none';
      return false;
    }

    const regex = /^(23BQ1A05[0-9]{2}|24BQ5A05[0-9]{2})$/;
    if (!regex.test(roll)) {
      if (rollFeedback) {
        rollFeedback.style.display = 'block';
        rollFeedback.className = 'field-feedback invalid';
        rollFeedback.textContent = 'Format error: Must be 23BQ1A05XX or 24BQ5A05XX';
      }
      iconError.style.display = 'block';
      return false;
    }

    if (EXCLUDED_23.includes(roll)) {
      if (rollFeedback) {
        rollFeedback.style.display = 'block';
        rollFeedback.className = 'field-feedback invalid';
        rollFeedback.textContent = `Roll number ${roll} is EXCLUDED from this drive.`;
      }
      iconError.style.display = 'block';
      return false;
    }

    if (roll.startsWith('23BQ1A05')) {
      const num = parseInt(roll.substring(8), 10);
      if (num < 1 || num > 63) {
        if (rollFeedback) {
          rollFeedback.style.display = 'block';
          rollFeedback.className = 'field-feedback invalid';
          rollFeedback.textContent = '23BQ1A05 series range is 01 to 63';
        }
        iconError.style.display = 'block';
        return false;
      }
    } else if (roll.startsWith('24BQ5A05')) {
      const num = parseInt(roll.substring(8), 10);
      if (num < 1 || num > 8) {
        if (rollFeedback) {
          rollFeedback.style.display = 'block';
          rollFeedback.className = 'field-feedback invalid';
          rollFeedback.textContent = '24BQ5A05 series range is 01 to 08';
        }
        iconError.style.display = 'block';
        return false;
      }
    }

    // Check if Roll Number has ALREADY uploaded a certificate
    const isAlreadyUploaded = (rosterData.submissions || []).some(
      s => s.rollNo.toUpperCase() === roll
    );

    if (isAlreadyUploaded) {
      if (rollFeedback) {
        rollFeedback.style.display = 'block';
        rollFeedback.className = 'field-feedback invalid';
        rollFeedback.textContent = `❌ Roll number ${roll} has ALREADY uploaded a certificate!`;
      }
      iconError.style.display = 'block';
      return false;
    }

    if (rollFeedback) rollFeedback.style.display = 'none';
    iconSuccess.style.display = 'block';
    return true;
  }

  // ----------------------------------------------------
  // 3. Drag & Drop File Upload & Naming Checker
  // ----------------------------------------------------
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleSelectedFile(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleSelectedFile(fileInput.files[0]);
  });

  btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFileSelection();
  });

  // Wrong Format Meme Modal Elements
  const wrongFormatModal = document.getElementById('wrongFormatModal');
  const closeWrongFormatBtn = document.getElementById('closeWrongFormatBtn');
  const btnFileRename = document.getElementById('btnFileRename');
  let invalidUploadedFile = null;

  function triggerWrongFormatFlow(file, customMsg) {
    invalidUploadedFile = file;

    // Reset file selection on main form
    resetFileSelection();

    // Directly open the Meme Template modal!
    if (wrongFormatModal) {
      wrongFormatModal.style.display = 'flex';
    }
  }

  if (closeWrongFormatBtn) {
    closeWrongFormatBtn.addEventListener('click', () => {
      if (wrongFormatModal) wrongFormatModal.style.display = 'none';
    });
  }

  if (wrongFormatModal) {
    wrongFormatModal.addEventListener('click', (e) => {
      if (e.target === wrongFormatModal) {
        wrongFormatModal.style.display = 'none';
      }
    });
  }

  // File Rename option ONLY appears with Meme Template modal
  if (btnFileRename) {
    btnFileRename.addEventListener('click', () => {
      if (wrongFormatModal) wrongFormatModal.style.display = 'none';

      if (invalidUploadedFile) {
        const expected = getExpectedFileName();
        let targetName = expected;
        if (!targetName) {
          const baseName = invalidUploadedFile.name.replace(/\.[^/.]+$/, "");
          targetName = `${baseName}.pdf`;
        }

        const renamedBlob = invalidUploadedFile.slice(0, invalidUploadedFile.size, 'application/pdf');
        currentFile = new File([renamedBlob], targetName, { type: 'application/pdf' });

        dropzoneEmpty.style.display = 'none';
        filePreviewCard.style.display = 'flex';
        previewFileName.textContent = currentFile.name;
        previewFileSize.textContent = formatBytes(currentFile.size);

        updateFileNamingRequirement();
        showToast(`File format updated & renamed to "${targetName}" (.pdf)`, 'success');
      } else {
        fileInput.click();
      }
    });
  }

  function handleSelectedFile(file) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    
    if (!isPdf) {
      triggerWrongFormatFlow(file);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('REJECTED: File size exceeds 15MB', 'error');
      resetFileSelection();
      return;
    }

    currentFile = file;
    dropzoneEmpty.style.display = 'none';
    filePreviewCard.style.display = 'flex';
    previewFileName.textContent = file.name;
    previewFileSize.textContent = formatBytes(file.size);

    updateFileNamingRequirement();
  }

  function resetFileSelection() {
    currentFile = null;
    fileInput.value = '';
    filePreviewCard.style.display = 'none';
    dropzoneEmpty.style.display = 'block';
    updateFileNamingRequirement();
  }

  function getExpectedFileName() {
    const roll = rollInput.value.toUpperCase().trim();
    const cName = courseNameInput ? courseNameInput.value.trim().replace(/[/\\?%*:|"<>]/g, '') : '';
    if (roll && cName) return `${roll}_${cName}.pdf`;
    return null;
  }

  function updateFileNamingRequirement() {
    const roll = rollInput.value.toUpperCase().trim();
    const cName = courseNameInput ? courseNameInput.value.trim().replace(/[/\\?%*:|"<>]/g, '') : '';

    let patternStr = 'ROLLNUMBER_COURSENAME.pdf';
    if (roll && cName) {
      patternStr = `${roll}_${cName}.pdf`;
    } else if (roll) {
      patternStr = `${roll}_[COURSENAME].pdf`;
    } else if (cName) {
      patternStr = `[ROLLNUMBER]_${cName}.pdf`;
    }

    if (requiredNamePattern) {
      requiredNamePattern.textContent = patternStr;
    }

    if (!namingStatusBox || !namingStatusText || !namingIcon) return;

    namingStatusBox.className = 'naming-status-box';
    namingIcon.className = 'fa-solid fa-circle-info';
    namingStatusText.textContent = (roll && cName)
      ? `Suggested File Name: ${roll}_${cName}.pdf`
      : 'Enter Roll Number & Course Name above to generate exact file name.';
  }

  // Initial call
  updateFileNamingRequirement();

  // ----------------------------------------------------
  // 4. Form Submit Handler
  // ----------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const rollNo = rollInput.value.toUpperCase().trim();
    const course = courseSelect.value;
    const courseName = courseNameInput ? courseNameInput.value.trim() : '';

    if (!name) {
      showToast('Please enter full student name', 'warning');
      nameInput.focus();
      return;
    }

    if (!validateRollNumber(rollNo)) {
      showToast('Please enter a valid Roll Number', 'warning');
      rollInput.focus();
      return;
    }

    if (!course) {
      showToast('Please select category/platform from drop down', 'warning');
      courseSelect.focus();
      return;
    }

    if (!courseName) {
      showToast('Please enter Course Name', 'warning');
      courseNameInput.focus();
      return;
    }

    if (!currentFile) {
      showToast('Please attach your PDF certificate file', 'warning');
      return;
    }

    const expectedName = getExpectedFileName();
    if (currentFile.name !== expectedName) {
      triggerWrongFormatFlow(currentFile, `REJECTED: File naming format invalid! File MUST be named "${expectedName}".`);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('rollNo', rollNo);
    formData.append('course', course);
    formData.append('courseName', courseName);
    formData.append('certificatePdf', currentFile, currentFile.name);

    btnSubmit.disabled = true;
    btnSubmit.querySelector('.btn-text').style.display = 'none';
    btnSubmit.querySelector('.btn-spinner').style.display = 'inline-block';

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(`🎉 ${result.message}`, 'success');
        form.reset();
        resetFileSelection();
        
        // Immediate Live Counter Update
        fetchLiveStatus();
      } else {
        showToast(`❌ ${result.error || 'Upload failed'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(`Network error: ${err.message}`, 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.querySelector('.btn-text').style.display = 'inline-block';
      btnSubmit.querySelector('.btn-spinner').style.display = 'none';
    }
  });

  // ----------------------------------------------------
  // 5. Admin Authentication & Dashboard
  // ----------------------------------------------------
  openAdminBtn.addEventListener('click', () => {
    adminAuthModal.style.display = 'flex';
    adminUsername.focus();
  });

  closeAdminAuthBtn.addEventListener('click', () => {
    adminAuthModal.style.display = 'none';
    adminAuthFeedback.textContent = '';
    adminAuthForm.reset();
  });

  closeAdminDashBtn.addEventListener('click', () => {
    adminDashboardModal.style.display = 'none';
  });

  btnLogoutAdmin.addEventListener('click', () => {
    adminDashboardModal.style.display = 'none';
    showToast('Logged out of Admin Portal', 'info');
  });

  adminAuthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = adminUsername.value.trim();
    const pass = adminPassword.value.trim();

    if (pass === '2027') {
      adminAuthFeedback.textContent = '';
      adminAuthForm.reset();
      adminAuthModal.style.display = 'none';

      adminDashboardModal.style.display = 'flex';
      fetchLiveStatus();
      showToast('Welcome to Admin Portal', 'success');
    } else {
      adminAuthFeedback.textContent = 'Invalid username or password. Please try again.';
    }
  });

  // Sub-tabs in Admin Dashboard
  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSub = btn.getAttribute('data-subtab');
      subtabBtns.forEach(b => b.classList.remove('active'));
      subtabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetSub).classList.add('active');
    });
  });

  function renderAdminTables() {
    const searchTerm = (adminSearchInput ? adminSearchInput.value : '').toLowerCase().trim();

    // Pending Table
    if (pendingTableBody) {
      pendingTableBody.innerHTML = '';
      const filteredPending = (rosterData.pendingList || []).filter(r => r.toLowerCase().includes(searchTerm));

      if (filteredPending.length === 0) {
        pendingTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">No pending students found.</td></tr>`;
      } else {
        filteredPending.forEach((roll, idx) => {
          const series = roll.startsWith('23BQ1A05') ? '23 Series' : '24 Series';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><span class="roll-code">${roll}</span></td>
            <td>${series}</td>
            <td><span class="status-badge pending"><i class="fa-solid fa-clock"></i> Not Uploaded</span></td>
            <td>
              <button class="btn-table-action btn-copy-roll" data-roll="${roll}">
                <i class="fa-regular fa-copy"></i> Copy
              </button>
            </td>
          `;
          pendingTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-copy-roll').forEach(b => {
          b.addEventListener('click', (e) => {
            const roll = e.currentTarget.getAttribute('data-roll');
            navigator.clipboard.writeText(roll);
            showToast(`Copied ${roll}`, 'success');
          });
        });
      }
    }

    // Uploaded Table
    if (uploadedTableBody) {
      uploadedTableBody.innerHTML = '';
      const submissions = rosterData.submissions || [];
      const filteredUploaded = submissions.filter(s => 
        s.rollNo.toLowerCase().includes(searchTerm) ||
        s.name.toLowerCase().includes(searchTerm) ||
        s.course.toLowerCase().includes(searchTerm) ||
        (s.courseName && s.courseName.toLowerCase().includes(searchTerm))
      );

      if (filteredUploaded.length === 0) {
        uploadedTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted); padding: 1.5rem;">No uploaded certificates match query.</td></tr>`;
      } else {
        filteredUploaded.forEach((sub, idx) => {
          const dateStr = new Date(sub.uploadedAt).toLocaleString();
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><span class="roll-code">${sub.rollNo}</span></td>
            <td><strong>${escapeHtml(sub.name)}</strong></td>
            <td><span class="badge-hint">${sub.course}</span></td>
            <td><strong>${escapeHtml(sub.courseName || 'N/A')}</strong></td>
            <td><code>${sub.fileName}</code></td>
            <td>${dateStr}</td>
            <td>
              <a href="${sub.driveFileUrl || '#'}" target="_blank" rel="noopener" class="btn-table-action">
                <i class="fa-brands fa-google-drive"></i> Drive
              </a>
            </td>
            <td>
              <button class="btn-table-danger btn-delete-submission" data-roll="${sub.rollNo}" title="Reset submission">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          `;
          uploadedTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-delete-submission').forEach(b => {
          b.addEventListener('click', async (e) => {
            const roll = e.currentTarget.getAttribute('data-roll');
            if (confirm(`Reset submission for ${roll}?`)) {
              try {
                const delRes = await fetch(`/api/submission/${roll}`, { method: 'DELETE' });
                const delJson = await delRes.json();
                if (delJson.success) {
                  showToast(`Reset ${roll} submission`, 'success');
                  fetchLiveStatus();
                } else {
                  showToast(delJson.error, 'error');
                }
              } catch (err) {
                showToast(err.message, 'error');
              }
            }
          });
        });
      }
    }
  }

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', renderAdminTables);
  }

  // Export CSV
  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      let csv = 'Roll Number,Student Name,Platform,Course Name,Upload Status,File Name,Submission Date\n';

      (rosterData.submissions || []).forEach(s => {
        csv += `"${s.rollNo}","${s.name}","${s.course}","${s.courseName || 'N/A'}","Uploaded","${s.fileName}","${new Date(s.uploadedAt).toISOString()}"\n`;
      });

      (rosterData.pendingList || []).forEach(roll => {
        csv += `"${roll}","N/A","N/A","N/A","Not Uploaded","N/A","N/A"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_Report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      showToast('Downloaded CSV Report successfully!', 'success');
    });
  }

  // Utility Functions
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function showToast(message, type = 'info', duration = 4500) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease-in reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
});
