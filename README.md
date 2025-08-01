# Pawa AI Custom Bots Template

A powerful and flexible boilerplate for building intelligent AI-powered chatbots with advanced features like RAG (Retrieval-Augmented Generation), text-to-speech, and speech-to-text capabilities.

##  What This Project Does

The Pawa AI Custom Bots Template is a comprehensive solution that enables you to:

### Core Features
- #### RAG-Based AI Chatbots: Build intelligent bots that can retrieve and generate responses using your custom knowledge base
- ***Text-to-Speech (TTS)***: Convert bot responses into natural-sounding speech for voice interactions
- ***Speech-to-Text (STT)***: Enable voice input from users, making your bot accessible through spoken commands
- ***Custom Knowledge Base***: Upload and integrate your own documents, FAQs, and data sources
- ***Flexible Configuration***: Easy-to-customize bot logic, personality, and voice settings

### Use Cases
This template is perfect for building:
- **Customer Support Assistants** - Automated help desk with voice capabilities
- **Voice-Enabled Agents** - Hands-free interaction for accessibility or convenience  
- **Internal Q&A Bots** - Company knowledge base with instant voice responses
- **Educational Assistants** - Interactive learning companions with speech features
- **Personal Voice Assistants** - Custom AI helpers for specific domains

##  Technology Stack

This project leverages a modern AI-powered stack, integrating language and speech intelligence through PAWA AI services:

---

###  **Backend**
- **Framework**: FastAPI (Python)  
  A high-performance, asynchronous API framework used to serve chatbot and voice-related endpoints.

---

###  **Frontend**
- **Framework**: NestJS (TypeScript) *(optional or pluggable)*  
  Enterprise-grade Node.js framework for managing UI, user sessions, and routing client requests to backend services.

---

###  **AI/ML (Conversational Intelligence)**

- **Platform**: [PAWA AI](https://pawa.ai)
- **Chat Model**: `pawa-v1-blaze-20250318`  
  A powerful language model used for RAG (Retrieval-Augmented Generation) to generate context-aware responses based on user queries and uploaded knowledge base documents.

- **System Prompt**:  
  Configured to act as a **WCF Agent**, a professional assistant trained to help users with Tanzania’s Workers Compensation Fund (WCF) — answering in **Kiswahili or English**, based on the user's language.

- **Custom Behaviors**:  
  - `TEMPERATURE`: 0.3 (for controlled creativity)  
  - `MAX_TOKENS`: 4090 (long-form understanding)  
  - `SEED`: 2024 (reproducibility)  
  - `MEMORY ENABLED`: True (context retention across messages)

---

### **Speech Processing**

- **Text-to-Speech (TTS)**:
  - **Model**: `pawa-tts-v1-20250704`
  - **API**: `https://ai.api.pawa-ai.com/v1/audio/text-to-speech`
  - **Voice**: `ame` (natural-sounding voice)
  - **Features**:
    - High token support (up to 65K tokens)
    - Configurable `TEMPERATURE`, `TOP_P`, and `REP_PENALTY` for audio tuning

- **Speech-to-Text (STT)**:
  - **Model**: `pawa-stt-v1-20240701`
  - **API**: `https://ai.api.pawa-ai.com/v1/audio/speech-to-text`
  - **Features**:
    - Low-latency transcription
    - Accurate language detection (supports `sw` for Kiswahili)
    - `RESPONSE_FORMAT`: JSON (developer-friendly)

---

###  **Knowledge Base**

- **RAG Key (KB_REFERENCE_ID)**:  
  A unique ID (`kb-1238b2e7-3873-4ea3-8077-497f66f9583b`) that connects the chatbot to your uploaded dataset (`/data` folder).

- **Generate via**: `generate_kb.py`

---

###  **Other Configs**
- `TOOL_CHOICE`: `auto` (enables automatic use of tools like search or functions)
- `LANG`: `sw` (default response language is Kiswahili, auto-switching enabled)
- `IS_MUST_USE_KB`: *(optional)* — If enabled, ensures the bot always uses the knowledge base for answering.

---

>  **Summary**:  
> You're using **PAWA AI’s cutting-edge models** to enable deep, context-aware conversations, powered by your own documents — plus native voice interactions in Kiswahili and English.


##  Prerequisites

Before you begin, make sure you have the following installed and ready:

- *** Python 3.8+**  
  Required for running the FastAPI backend, including RAG and speech processing logic.

- *** Node.js 16+ and npm or yarn**  
  Needed if you're using the optional NestJS frontend. Choose one package manager (either `npm` or `yarn`).

- *** API Keys**  
  - **PAWA AI Chat API Key** – used to access the chatbot model (`pawa-v1-blaze-20250318`)
  - **TTS/STT API Key** – for voice features (Text-to-Speech and Speech-to-Text via PAWA AI)

- *** Basic Knowledge of**:
  - **Python** – to work with backend logic, FastAPI, and utilities
  - **TypeScript** – to understand and customize the frontend (if applicable)
  - **REST APIs** – to connect and test backend endpoints

>  **Note**: Do not commit your actual API keys to version control. Use a `.env` file and share a `.env.example` instead.

##  Quick Start for wcf bot

### 1. Clone the Repository
```bash
git https://github.com/Sartify/pawa-ai-blueprints-chatbots.git
cd pawa-ai-blueprints-chatbots.git
```

### 2. Install Dependencies

**Backend (FastAPI):**
```bash
cd wcfbot
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend (NestJS):**
```bash
cd wcf
cd frontend
npm install
# or
yarn install
```

### 3. Configure Environment

First, copy the example environment file:

```bash
cp .env.example .env

Then, edit the .env file with your actual configuration:
# === PAWA AI API Configuration ===
PAWA_AI_API_KEY=your_pawa_ai_api_key_here
CHAT_MODEL=pawa-v1-blaze-20250318
PAWA_SYSTEM_PROMPT=Your system prompt here

# === RAG Knowledge Base ===
KB_REFERENCE_ID=your_kb_reference_id
IS_MEMORY_ENABLED=True

# === Text-to-Speech (TTS) ===
TTS_API_URL=https://ai.api.pawa-ai.com/v1/audio/text-to-speech
TTS_MODEL=pawa-tts-v1-20250704
VOICE=ame

# === Speech-to-Text (STT) ===
STT_API_URL=https://ai.api.pawa-ai.com/v1/audio/speech-to-text
STT_MODEL=pawa-stt-v1-20240701

# === Language and Format Settings ===
LANG=sw
RESPONSE_FORMAT=json

# === (Optional) Database Configuration ===
# DATABASE_URL=your_database_url_here

# === Bot Behavior Tuning ===
TEMPERATURE=0.3
TOP_P=0.95
MAX_TOKENS=4090
FREQUENCY_PENALTY=0.3
PRESENCE_PENALTY=0.3
SEED=2024
TOOL_CHOICE=auto
```
###  4. Set Up Your Knowledge Base

To enable RAG (Retrieval-Augmented Generation), you'll need to upload and index your custom documents.

```bash
# Create your data directory (if it doesn't exist)
mkdir -p wcfbot/back-end/data

# Add your documents (PDF, TXT, MD, DOCX, etc.)
cp your_documents/* wcfbot/back-end/data/

# Navigate to backend
cd wcfbot/back-end

# Generate your knowledge base reference ID
python generate_kb.py

Next Step:
Copy the kbReferenceId output from the script and paste it into your .env file under:
```
### 5. Run the Application
  ***Start the Backend (FastAPI)***
```bash
cd wcfbot
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# or
python3 main.py
```
  ***Start the Frontend (NestJS):***
```bash
cd wcfbot
cd frontend
npm run dev
# or
yarn start:dev
```


##  Troubleshooting

### Common Issues

**Bot not responding:**
- Check API keys in `.env` file
- Verify knowledge base is properly indexed
- Check server logs for errors

**Voice features not working:**
- Ensure microphone permissions are granted
- Verify TTS/STT service credentials
- Check browser compatibility for Web Speech API

**Knowledge base not updating:**
- Run `python scripts/reindex_knowledge.py` from backend directory
- Check file permissions in `backend/knowledge_base/` directory
- Verify supported file formats


##  Contributing

We welcome contributions! Please see our [Contributing Guide](README..md) for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  Acknowledgments

- **PAWA AI** – for providing powerful models for chat, speech-to-text, and text-to-speech.
- **FastAPI** – for the lightweight, high-performance backend framework.
- **Open-source libraries** – for enabling document processing, vector storage, and voice features.
- **The developer community** – for continuous inspiration, reusable tools, and shared knowledge.

##  Support

If you encounter any issues or have questions, please reach out through the following channels:

- **Report Issues**:https://github.com/Sartify/pawa-ai-blueprints-chatbots.git)   
- **Email Support**: info@sartify.com
- **Phone Number**: (255) 612-704807

We’re here to help and welcome your feedback!

Ready to build your intelligent AI bot? Get started now and create amazing conversational experiences! 
## 📞 Support

- **Documentation**: [Link to full docs]
- **Issues**: [GitHub Issues](https://github.com/yourusername/pawa-ai-custom-bots-template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pawa-ai-custom-bots-template/discussions)
- **Email**: support@pawaai.com

---

**Ready to build your intelligent AI bot?** Get started now and create amazing conversational experiences! 🚀