# 📜 मुक्त काव्य (Mukt Kavya) - Kavita Management System

An enterprise-grade, royal multilingual poetry management portal built with **React (Frontend)**, **Node.js & Express (Backend)**, **MongoDB Atlas (Live Database)**, and **Brevo Transactional Email Gateway**.

---

## 🌟 Key Features

### 1. 🌐 Multilingual & Regional Language Support
- Full unicode support for **Hindi, Urdu (اردو), Bengali (বাংলা), Gujarati (ગુજરાતી), Marathi (मराठी), English, Punjabi, Tamil, Telugu, Kannada, Malayalam, Odia, Assamese, and Sanskrit**.
- Styled with bespoke Google Fonts: *Rozha One, Tiro Devanagari Hindi, Amiri (Nastaliq), Noto Serif Devanagari/Bengali/Gujarati, Cinzel, and Outfit*.
- Instant language filter pills and search across headings, stanzas, and poet pen names.

### 2. 👑 Multi-Role Platform Architecture
- **Super Admin**: Platform-wide analytics, user governance (promote/demote to Super Admin, Admin, Writer, Reader), system-wide poem moderation, Brevo mail verification suite.
- **Editorial Admin**: Review and moderate submitted poems (1-click Approve, Feature for *Aaj Ki Kavita*, Reject/Draft, Delete).
- **Poet / Writer Profile**:
  - **रचना कक्ष (Poet's Studio)**: Compose poems with structured Headings, Subtitles/Dedications, Stanzas, Rasas, and Form styles.
  - **Live Interactive Canvas**: Real-time canvas preview beside the editor.
  - **8 Bespoke Background Themes**: Vintage Parchment, Royal Velvet, Midnight Cosmos, Golden Sunset, Emerald Forest, Rose Saffron, Obsidian Minimal, and Classic Ivory.
  - **दीवान (Poet's Dashboard)**: Private poem library, readership metrics, and **"Export All" Diwan Anthology Book PDF** generator.
- **Reader / Public**:
  - **आज की कविता (Verse of the Day)** highlighted banner.
  - **Immersion Reading Modal**: Dynamic live theme switcher, font size slider (A-/A+), ambient audio recital player, appreciations, and reader reflections.

### 3. 📄 Premium PDF & Social Card Export Engine
- **Collector's Single Kavita PDF**: 300 DPI high-resolution render preserving Devanagari ligatures, author signature seal, and selected background canvas theme.
- **Social Media Image Card (PNG)**: Instant download for WhatsApp and Instagram status sharing.
- **"Export All" Diwan Anthology Book**: One-click compilation of a poet's entire poetry collection into a formatted book PDF with Title Cover, Index, and styled pages.

### 4. ✉️ Brevo (formerly Sendinblue) Transactional Mailer
- Automatic welcome emails upon poet/reader registration.
- Publication notification emails.
- Live admin test mailer suite with fallback development logger.

---

## 🚀 Live Demo Credentials

Use the **Live Demo Switcher bar** at the top of the app to switch roles instantly with a single click, or log in manually with:

| Role | Email | Password |
|---|---|---|
| **👑 Super Admin** | `superadmin@muktkavya.com` | `Password123!` |
| **🛡️ Content Admin** | `admin@muktkavya.com` | `Password123!` |
| **✍️ Poet (Hindi Veer Rasa)** | `dinkar@muktkavya.com` | `Password123!` |
| **✍️ Poet (Urdu Ghazal)** | `ghalib@muktkavya.com` | `Password123!` |
| **✍️ Poet (Bengali Shant Rasa)**| `tagore@muktkavya.com` | `Password123!` |
| **✍️ Poet (Gujarati)** | `kalapi@muktkavya.com` | `Password123!` |
| **✍️ Poet (Marathi)** | `bahinabai@muktkavya.com` | `Password123!` |
| **📖 Avid Reader** | `reader@muktkavya.com` | `Password123!` |

---

## 🛠️ Project Structure

```
Mukt Kavya/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB Atlas connection with embedded fallback
│   │   └── store.js            # Zero-dependency local persistence engine
│   ├── controllers/
│   │   ├── authController.js   # JWT Auth & Poet profile endpoints
│   │   ├── kavitaController.js # Heading, stanzas, filters, and bulk Diwan export
│   │   └── adminController.js  # Analytics, moderation, and Brevo test suite
│   ├── middleware/
│   │   └── auth.js             # Protect & role authorization middleware
│   ├── models/
│   │   ├── User.js             # User & Poet schema
│   │   ├── Kavita.js           # Poem schema with multilingual text indexing
│   │   ├── Comment.js          # Reader reflection schema
│   │   └── index.js            # Unified model proxy
│   ├── routes/                 # Express API routes
│   ├── services/
│   │   └── brevoEmailService.js# Brevo transactional email sender
│   ├── seed.js                 # Database seeder with authentic poems
│   └── server.js               # Express application entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Royal navigation & instant demo switcher
│   │   │   ├── HeroSection.jsx     # Rotating verses ticker & search
│   │   │   ├── DailyFeaturedCard.jsx# Aaj Ki Kavita card with audio recital
│   │   │   ├── KavitaCard.jsx      # Feed card with quick PDF export
│   │   │   ├── PoemReaderModal.jsx # Reading room with live 8-theme switcher
│   │   │   ├── PoetStudio.jsx      # Kavita editor with live canvas preview
│   │   │   ├── PoetDashboard.jsx   # Diwan collection & "Export All" book
│   │   │   ├── AdminPortal.jsx     # Analytics, user roles & Brevo tester
│   │   │   ├── AuthModal.jsx       # Multi-role authentication modal
│   │   │   └── Footer.jsx          # Royal footer tribute
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # User state & 1-click role switcher
│   │   ├── services/
│   │   │   └── api.js              # REST client
│   │   ├── utils/
│   │   │   └── pdfExport.js        # High-res PDF, Image card, & Anthology generator
│   │   ├── index.css               # 8 Themes & Vanilla CSS design system
│   │   ├── App.jsx                 # Master application controller
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 🏃 Running the Application

### 1. Backend Server
```powershell
cd "c:\Users\impra\Desktop\Mukt Kavya\backend"
node server.js
```
Runs at: `http://localhost:5000` (API: `http://localhost:5000/api/health`)

### 2. Frontend Application
```powershell
cd "c:\Users\impra\Desktop\Mukt Kavya\frontend"
npm run dev
```
Runs at: `http://localhost:5173`
