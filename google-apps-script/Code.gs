/**
 * Google Apps Script for Student Certificate Drive Uploader & Validation
 * 
 * Target Google Drive Folders:
 * APSSDC: https://drive.google.com/drive/folders/18swFrqVgZhPOOybWs4SnVD1m_zpu2E29
 * APSCHE: https://drive.google.com/drive/folders/1_3I_QADN7cx238--wPgpT58HsG_-mZ2_
 * OTHER CERTIFICATES: https://drive.google.com/drive/folders/1_NfcnPoxEfJ7eufTwKKM0b47TiWI--X7
 */

const FOLDER_IDS = {
  "APSSDC": "18swFrqVgZhPOOybWs4SnVD1m_zpu2E29",
  "APSCHE": "1_3I_QADN7cx238--wPgpT58HsG_-mZ2_",
  "OTHER AICTE CERTIFICATES": "1_NfcnPoxEfJ7eufTwKKM0b47TiWI--X7"
};

/**
 * Handles Web App HTTP POST requests
 */
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const { name, rollNo, course, fileName, fileData, mimeType } = contents;

    // 1. Roll Number Validation
    const cleanRoll = (rollNo || '').trim().toUpperCase();
    const rollPattern = /^(23BQ1A05[0-9]{2}|24BQ5A05[0-9]{2})$/;
    
    if (!rollPattern.test(cleanRoll)) {
      return jsonResponse({
        success: false,
        error: "REJECTED: Roll Number format must be 23BQ1A05XX or 24BQ5A05XX."
      });
    }

    // 2. MIME Type / Extension check (ONLY PDF format)
    const lowerName = (fileName || '').toLowerCase();
    const isPdfMime = mimeType === "application/pdf";
    const isPdfExt = lowerName.endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      return jsonResponse({
        success: false,
        error: "REJECTED: Only PDF format files are allowed!"
      });
    }

    // 3. File Naming Format Check: MUST BE ROLLNUMBER_COURSENAME (e.g. 23BQ1A0501_APSSDC)
    const expectedBaseName = cleanRoll + "_" + course; // e.g. 23BQ1A0501_APSSDC
    const uploadedBaseName = fileName.replace(/\.pdf$/i, '').trim();

    if (uploadedBaseName !== expectedBaseName) {
      return jsonResponse({
        success: false,
        error: `REJECTED: Invalid File Name! File must be named exactly "${expectedBaseName}.pdf". Received: "${fileName}".`
      });
    }

    // 4. Locate Target Google Drive Folder
    const targetFolderId = FOLDER_IDS[course];
    if (!targetFolderId) {
      return jsonResponse({
        success: false,
        error: `REJECTED: Invalid course target "${course}".`
      });
    }

    const folder = DriveApp.getFolderById(targetFolderId);

    // 5. Decode Base64 & Upload File
    let rawBase64 = fileData;
    if (fileData.indexOf(',') !== -1) {
      rawBase64 = fileData.split(',')[1];
    }
    
    const decodedBytes = Utilities.base64Decode(rawBase64);
    const finalFileName = expectedBaseName + ".pdf";
    const blob = Utilities.newBlob(decodedBytes, "application/pdf", finalFileName);

    const createdFile = folder.createFile(blob);
    createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = createdFile.getUrl();
    const fileId = createdFile.getId();

    return jsonResponse({
      success: true,
      message: "File uploaded successfully to Google Drive!",
      fileId: fileId,
      fileUrl: fileUrl,
      fileName: finalFileName,
      folderId: targetFolderId
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: "Google Script Exception: " + err.toString()
    });
  }
}

/**
 * Standard GET handler for quick testing
 */
function doGet(e) {
  return jsonResponse({
    status: "Active",
    message: "Google Apps Script Certificate Uploader Endpoint is operational."
  });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
