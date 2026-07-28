# ⚡ Gratzis ChatBot

A modern, fast, and simple AI Chatbot Web Application built with React, Vite, and Vanilla CSS. Featuring Client-Side AES-256-GCM encrypted Cloud Storage Sync.


---

## 🚀 Ready for Vercel Deployment

This project is fully configured for deployment on [Vercel](https://vercel.com).

### Option 1: Deploy via Vercel GitHub Integration (Recommended)
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" -> "Project"**.
3. Import your GitHub repository `Gratzis`.
4. Vercel will automatically detect the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**.

### Option 2: Deploy via Vercel CLI
If you have Vercel CLI installed locally:
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to your Vercel account
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Security & Privacy
- **Zero-Local History**: Chat sessions are stored in browser `sessionStorage` and automatically cleared when the browser tab closes.
- **AES-256-GCM Encryption**: Cloud storage backup files are encrypted client-side using Web Crypto API (`window.crypto.subtle`) with PBKDF2 key derivation.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE) © 2026 **yoviekobba**.
