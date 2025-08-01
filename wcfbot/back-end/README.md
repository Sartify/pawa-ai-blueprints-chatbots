#  Project Setup Guide

Follow the steps below to get your development environment up and running.

---

## 1. Clone the Repository

git clone https://github.com/Sartify/pawa-ai-custom-bots-template.git  
cd pawa-ai-custom-bots-template

---

## 2. Create and Activate a Virtual Environment

For **Linux/macOS**:

    python3 -m venv venv
    source venv/bin/activate

For **Windows**:

    python -m venv venv
    venv\Scripts\activate

---

## 3. Navigate to the Backend Directory

    cd wcfbot
    cd back-end

---

## 4. Install Dependencies

    pip install -r requirements.txt

---

## 5. Generate the Key

Inside the `back-end` directory, run:

    python generate_kb.py

This script will output a `kbReferenceId`. **Copy this value** for the next step.

---

## 6. Configure the Environment

1. Create or open the `.env` file inside the `back-end` directory.
2. Add the following line, replacing `kbReferenceId` with the actual key:

    RAG_KEY=kbReferenceId
