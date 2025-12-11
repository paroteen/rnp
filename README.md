# Rwanda National Police (RNP) Recruitment Portal

A comprehensive, secure, and modern web application designed to digitize the recruitment process for the Rwanda National Police. This portal handles the entire lifecycle from candidate registration to final selection, featuring AI-powered assessments, proctored exams, and an advanced administration dashboard.

## 🚀 Features

### Public Portal
*   **Landing Page:** Professional UI with RNP branding, animations, and recruitment highlights.
*   **Requirements Check:** Detailed eligibility criteria for Constables and Officers.
*   **Smart Application Form:** Multi-step form with validation (NID, Phone, Age).
*   **AI Body Analysis:** Simulates AI analysis of uploaded photos to estimate height and fitness.
*   **Application Status Tracker:** Real-time tracking of application progress.

### Candidate Experience
*   **Secure Online Exam:** Full-screen proctored environment with tab-switching detection.
*   **Interview Scheduling:** Interactive calendar to book physical interview slots.
*   **Notifications:** Visual feedback on status changes (Shortlisted, Invited, Rejected).

### Administration (Recruiters)
*   **Applicant Dashboard:** Filter, search, and view all candidates.
*   **Verification Center:** Mock integration with NIDA (ID), NESA (Education), and Police Clearance.
*   **Workflow Management:** Move candidates through stages (Shortlist -> Exam -> Interview).
*   **AI Insights:** View fraud scores and photo analysis results.

### Super Admin (Command Center)
*   **Analytics:** Visual charts for recruitment funnel, demographics, and exam performance.
*   **System Control:** Freeze/Unfreeze recruitment and set global announcements.
*   **Exam Management:** Add/Edit/Delete exam questions dynamically.
*   **Audit Logs:** Track all system actions for security.

## 🛠️ Tech Stack

*   **Frontend:** React (v18+), TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **Forms:** React Hook Form
*   **AI:** Google Gemini API (via `@google/genai` SDK)

## ⚙️ Installation & Setup

1.  **Clone/Download the repository**
    ```bash
    git clone <repository-url>
    cd rnp-recruitment-portal
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Visit `http://localhost:5173` (or the port shown in your terminal).

## 🔑 Access Credentials

### Recruiter Admin Panel
*   **URL:** `/` (Click "Admin" in Navbar)
*   **Access Code:** ``
*   **Role:** View applicants, verify documents, shortlist candidates.

### Super Admin Command Center
*   **URL:** `/` (Or login via Admin panel)
*   **Access Code:** `
*   **Role:** Full system control, analytics, manage other admins, edit exams.

## 📂 Project Structure

```
/src
  /components    # Reusable UI components (Navbar, Footer, ChatBot)
  /pages         # Main route views (Home, Apply, Admin, etc.)
  /services      # Logic for Storage (Mock DB) and AI
  App.tsx        # Main router setup
  types.ts       # TypeScript interfaces
```

## 📝 Important Notes for Local Run

*   **Mock Backend:** This project uses `localStorage` to simulate a backend database. Data persists in your browser but won't be shared across devices. To reset data, go to **Super Admin > Database > Factory Reset**.
*   **AI Features:** The ChatBot requires a valid Gemini API Key. Create a `.env` file with `VITE_API_KEY=your_key` if you wish to enable the live chatbot.
*   **Exam Proctoring:** The webcam feed is simulated for privacy reasons in this demo.

## 🛡️ License

Private - Rwanda National Police Digital Transformation Project.
