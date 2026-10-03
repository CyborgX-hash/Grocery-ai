# 🛒 MessyList

> **Turn chaotic roommate messages into a clean, structured grocery shopping list.**
> Built for the Hacktoberfest 2026 DEV Challenge: *"Build for a Friend"*.

---

## 📌 The Problem

Anyone who has ever lived with a roommate knows the chaos of the shared grocery chat. Instead of a tidy list, your inbox gets hit with a stream of consciousness across 10 rapid-fire text messages in a mix of Hindi, Hinglish, and English:

> *"bhai milk le aana"*  
> *"bread bhi"*  
> *"brown wali jo last time li thi"*  
> *"eggs bhi khatam hai"*  
> *"actually Rahul eggs la raha"*  
> *"atta bhi le aa 5kg wala"*  
> *"aur wahi chips jo last time liye the"*  

Before you can even start shopping at the supermarket, you have to mentally decode:
1. Which items are actually needed?
2. What are the quantities and units?
3. Which items were **cancelled** or taken care of by someone else mid-sentence?
4. What specific brands does your roommate prefer (*"brown wali"*, *"wahi chips jo last time liye the"*)?

---

## 💡 The Solution

**MessyList** is a personal AI grocery assistant that understands messy human communication. 

```
MESSY HUMAN MESSAGES (Hinglish/English)
                  ↓
       OPEN-WEIGHT AI (Gemma)
                  ↓
UNDERSTAND INTENT + ITEMS + QUANTITY + CORRECTIONS
                  ↓
   CROSS-REFERENCE KITCHEN PREFERENCES
                  ↓
       STRUCTURED SHOPPING LIST
                  ↓
  PURCHASE TRACKING & KITCHEN MEMORY
```

You paste the unedited chat message dump directly into MessyList. The AI parses the items, calculates quantities, respects conversational cancellations (*"actually Rahul eggs la raha"* ➔ Eggs marked **Cancelled**), applies your roommate's favorite brands from memory, and produces an interactive shopping checklist you can take to the supermarket.

---

## ✨ Features

- 🧠 **Conversational Intelligence:** Understands conversational slang, Hindi/Hinglish phrasing (*"le aana"*, *"bhi"*, *"khatam hai"*, *"doodh"*, *"chawal"*), and multi-message context.
- 🚫 **Cancellation & Delegation Detection:** Detects mid-sentence updates (*"wait don't get X"*, *"Rahul is bringing eggs"*) and marks them as cancelled with transparent reasons rather than forgetting them.
- 🥛 **Household Memory & Kitchen Preferences:** Remembers that your roommate drinks *Amul Taaza Toned Milk* and eats *100% Whole Wheat Brown Bread*, automatically filling in the right brands when vague items are texted.
- 📋 **AI Review & Edit Screen:** Review the AI's interpretation with full editing power—change quantities, restore cancelled items, or add extra groceries manually before finalizing.
- ☑️ **Interactive Shopping Checklist:** Check off items as you walk through supermarket aisles, complete with progress tracking, celebratory completion confetti, and filters (All / Pending / Purchased).
- 📜 **Purchase History:** Archived log of previous grocery runs with dates, item counts, and completion statuses.
- ⚡ **Zero-Friction Demo Mode:** Works instantly out-of-the-box using an intelligent deterministic open-weight emulator when an API key isn't provided, and switches to live Gemma when configured.
- 🌓 **Curated Light & Dark Themes:** Sleek, accessible modern UI with persistent theme toggle and mobile bottom navigation.
- 🔒 **Privacy-First Architecture:** Open-weight model ready with backend-only API calls—no keys exposed to the client.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Design System, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js (Modular Controllers, Services, and Routes) |
| **Database & ORM** | PostgreSQL with Prisma ORM |
| **AI Layer** | Open-Weight **Google Gemma** (`gemma-2-9b-it`) via clean pluggable service abstraction |
| **Validation** | Zod (strict schema validation on all inputs and AI outputs) |

---

## 🧠 How the AI Pipeline Works

1. **Context Enrichment:** The backend queries the user's saved `GroceryPreference` records from the database (e.g. Milk ➔ Amul Taaza, Atta ➔ 5kg).
2. **Prompt Assembly:** The system prompt instructs the model to extract items, quantities, categories, detect conversational cancellations, and output strict JSON.
3. **Model Execution:**
   - **When `GEMMA_API_KEY` is present:** Requests are sent to the configured Gemma API endpoint (`GEMMA_API_URL`).
   - **When in Demo Mode (`GEMMA_API_KEY` empty):** An intelligent, deterministic open-weight emulation engine executes parsing and preference matching locally.
4. **Output Validation:** The JSON response is validated with Zod schemas to ensure every item has valid names, non-zero quantities, proper units, and clean status flags before saving.

---

## 🔓 Why an Open-Weight AI Model?

MessyList is built around open-weight models like **Google Gemma 2**:
- **Data Privacy:** Roommate conversations, daily routines, and home dietary habits remain under user control.
- **Provider Independence:** Open-weight models can be run via Hugging Face, Google AI Studio, self-hosted via vLLM / Ollama, or on private home servers.
- **Zero Lock-In:** Because the model weights are open, the service layer is not tied to any proprietary closed API vendor.
- **Fine-Tuning Potential:** Open weights allow fine-tuning on local regional dialects and colloquial slang without leaking proprietary household data.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (running locally or a cloud database URL like Supabase/Neon)

---

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/messylist.git
cd messylist

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

---

### 2. Configure Environment Variables

Create `.env` in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5001
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/messylist"

# Open-Weight AI Configuration (Gemma)
# Leave GEMMA_API_KEY blank to run in intelligent Demo Mode out of the box!
GEMMA_API_KEY=
GEMMA_API_URL="https://api-inference.huggingface.co/models/google/gemma-2-9b-it"
GEMMA_MODEL="google/gemma-2-9b-it"
```

---

### 3. Database Setup & Seeding

```bash
cd backend

# Sync Prisma schema with your database
npx prisma db push

# Seed realistic roommate preferences & sample purchase history
npm run prisma:seed
```

---

### 4. Running the Application

You can start both backend and frontend concurrently or in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Backend starts at http://localhost:5001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Frontend starts at http://localhost:3000
```

Open your browser at **`http://localhost:3000`**.

---

## 🔑 Connecting Your Gemma API Credentials Later

When you are ready to connect a live Gemma model, open `backend/.env` and supply:

```env
# 1. Your API key (Hugging Face User Access Token or Google AI Studio key)
GEMMA_API_KEY="your-gemma-api-key-here"

# 2. Gemma API Endpoint
# Hugging Face:
GEMMA_API_URL="https://api-inference.huggingface.co/models/google/gemma-2-9b-it"

# Or Google AI Studio:
# GEMMA_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemma-2-9b-it:generateContent"

# Or local Ollama / vLLM:
# GEMMA_API_URL="http://localhost:11434/v1/chat/completions"

# 3. Model identifier
GEMMA_MODEL="google/gemma-2-9b-it"
```

Restart the backend server (`npm run dev` in `backend/`). The application will immediately switch from `Demo AI Mode` to `Connected to Gemma`.

---

## 🧪 Testing the Complete Demo Flow

1. Open `http://localhost:3000`.
2. Click **"Try Roommate Demo"** on the hero banner.
3. The chaotic WhatsApp message dump will automatically populate:
   ```text
   bhai milk le aana
   bread bhi
   brown wali
   eggs bhi khatam hai
   actually Rahul eggs la raha
   atta bhi le aa 5kg wala
   aur wahi chips jo last time liye the
   ```
4. Click **"Generate Smart List with AI"**.
5. Watch the step-by-step cognitive reasoning animation.
6. On the **Review Screen**, observe:
   - **Amul Taaza Toned Milk** (`1 packet` • `Dairy`) with **`Roommate Pref`** badge.
   - **Brown Bread** (`1 pack` • `Bakery`) with **`Roommate Pref`** badge.
   - **Farm Fresh White Eggs** marked as **`Cancelled`** (*"Rahul is bringing eggs"*).
   - **Aashirvaad Shudh Chakki Atta** (`5 kg` • `Pantry & Grains`).
   - **Chips** (`2 packs` • `Snacks`).
7. Click **"Save Shopping List"**.
8. In the **Shopping Checklist**, check items off as you buy them and observe the progress bar update in real-time.
9. Visit the **Preferences** tab to view or customize household kitchen memory.

---

## 🔮 Future Improvements

- 🎙️ **Voice Message Transcriptions:** Upload raw WhatsApp `.ogg` voice notes and transcribe them directly.
- 💬 **WhatsApp / Telegram Webhook Bot:** Roommates can text a dedicated bot number, which updates the shared shopping list in real-time.
- 🏷️ **Local Supermarket Price Comparison:** Cross-reference items with local delivery platforms (Blinkit, Zepto, Instacart).
- 🧾 **Receipt Scanning & OCR:** Scan physical supermarket paper bills to automatically reconcile purchased items and split expenses among roommates.

---

## 📄 License

MIT License. Built with ❤️ for roommates everywhere.
