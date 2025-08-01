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
- **Embedding-Based Search Systems** - Use Pawa AI's embedding model to semantically index and retrieve answers from large document sets or FAQs

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

### **AI/ML (Conversational Intelligence)**

- **Chat Model (RAG)**:
   - **CHAT_MODEL** = 'pawa-v1-blaze-20250318, 'pawa-v1-ember-20240924'

    - **API**: 'https://ai.api.pawa-ai.com/v1/chat/completions'

    - **Purpose**: 'Retrieval-Augmented Generation (RAG)'

    - **Features**:

        - Context-aware response generation

        - Seamless integration with custom knowledge bases

        - Supports long-form conversations and document referencing


### **Vector Embeddings**

- **Model**: `pawa-embedding-v1-20240701`
- **API**: `https://staging.api.pawa-ai.com/v1/vectors/embedding`
- **Features**:
  - Language: `multi` (multilingual support)
  - Accepts `sentences[]` as input for dense vector generation
  - Use case: document chunk embedding for semantic search and RAG indexing

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

>  **Summary**:  
> You're using **PAWA AI’s cutting-edge models** to enable deep, context-aware conversations, powered by your own documents — plus native voice interactions in Kiswahili and English.


##  Prerequisites

Before you begin, make sure you have the following installed and ready:

- ***Python 3.8+***  
  Required for running the FastAPI backend, including RAG and speech processing logic.

- ***Node.js 16+ and npm or yarn***  
  Needed if you're using the optional NestJS frontend. Choose one package manager (either `npm` or `yarn`).

- ***API Keys***  
  - **PAWA AI Chat API Key** – used to access the chatbot model (`pawa-v1-blaze-20250318`)
  - **TTS/STT API Key** – for voice features (Text-to-Speech and Speech-to-Text via PAWA AI)

- ***Basic Knowledge of***:
  - **Python** – to work with backend logic, FastAPI, and utilities
  - **TypeScript** – to understand and customize the frontend (if applicable)
  - **REST APIs** – to connect and test backend endpoints

>  **Note**: Do not commit your actual API keys to version control. Use a `.env` file and share a `.env.example` instead.

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

We welcome contributions! Please see our (pawa-ai-blueprints-chatbots/wcfbot/back-end/README.md) for more details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  Acknowledgments

- **PAWA AI** – for providing powerful models for chat, speech-to-text, text-to-speech, and creating vectore store.
- **FastAPI** – for the lightweight, high-performance backend framework.
- **Open-source libraries** – for enabling document processing, vector storage, and voice features.
- **The developer community** – for continuous inspiration, reusable tools, and shared knowledge.

##  Support

If you encounter any issues or have questions, please reach out through the following channels:

- **Report Issues**:https://github.com/Sartify/pawa-ai-blueprints-chatbots.git  
- **Email Support**: info@sartify.com
- **Phone Number**: (255) 612-704807

We’re here to help and welcome your feedback!

**Ready to build your intelligent AI bot?** Get started now and create amazing conversational experiences! 