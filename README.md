# Certificate Upload Web Application

A full-stack, mobile-responsive web portal designed for student certificate submission, automated file validation, real-time roster tracking, Google Drive integration via Google Apps Script, and MongoDB Atlas database persistence.

---

## 🌟 Features

- **Automated Roll Number Validation**: Validates student roll numbers against designated roster (23BQ1A0501–563 excl. 526, 529, 554 & 24BQ5A0501–508).
- **Strict File Naming Format**: Enforces file naming as `ROLLNUMBER_COURSENAME.pdf` (e.g. `23BQ1A0501_APSSDC.pdf`). Includes 1-click **Auto-Rename** helper for students.
- **PDF Format Only**: Rejects non-PDF files automatically.
- **One Member Upload Once**: Prevents duplicate submissions per student.
- **Google Drive Integration**: Uploads files directly into target Google Drive folders based on selected course:
  - **APSSDC**: `18swFrqVgZhPOOybWs4SnVD1m_zpu2E29`
  - **APSCHE**: `1_3I_QADN7cx238--wPgpT58HsG_-mZ2_`
  - **OTHER AICTE CERTIFICATES**: `1_NfcnPoxEfJ7eufTwKKM0b47TiWI--X7`
- **Real-Time Live Counter**: Displays Uploaded, Pending, and Total student statistics instantly.
- **Admin Portal Modal**: Protected admin section (Password: `2027`) to view submitted vs pending student rosters, download CSV reports, and reset submissions.

---

## 📁 Repository Structure

```text
├── .env                  # Environment configuration (DB connection string, GAS URL)
├── .gitignore            # Git ignore file for node_modules, .env, and local data
├── Code.gs               # Google Apps Script for Google Drive upload integration
├── README.md             # Project documentation
├── package.json          # Node.js dependencies and scripts
├── server.js             # Express server API endpoints
├── config/
│   └── db.js             # Mongoose MongoDB Atlas connection
├── models/
│   └── Submission.js     # MongoDB Submission Schema
├── utils/
│   └── roster.js         # Master student roster generation & validation
└── public/
    ├── index.html        # Main HTML layout
    ├── css/
    │   └── styles.css    # Responsive dark glassmorphism stylesheet
    └── js/
        └── app.js        # Client-side application logic
```

---

## 🚀 Quick Start

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (`.env`)**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://cseab2027_db_user:Cse-vvitu%402027@cluster0.ck7qaek.mongodb.net/certificate_portal?retryWrites=true&w=majority
   GAS_WEB_APP_URL=
   ```

4. **Run the Server**:
   ```bash
   node server.js
   ```

5. **Access Application**:
   Open `http://localhost:3000` in your web browser.

---

## 🔒 Admin Credentials

- **Username**: `admin`
- **Password**: `2027`

---

## 📄 Google Apps Script Setup

1. Open [script.google.com](https://script.google.com) and create a **New Project**.
2. Copy the contents of `Code.gs` from this repository and paste into Google Apps Script editor.
3. Click **Deploy** &rarr; **New Deployment**.
4. Select **Web App** (Execute as: *Me*, Who has access: *Anyone*).
5. Copy the deployed Web App URL into your `.env` file under `GAS_WEB_APP_URL`.
