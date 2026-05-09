# MiniMacro Processor

A full-stack web application simulating a Two-Pass Macro Processor used in System Programming and Compiler Construction (SPCC).

![MiniMacro Processor Demo](https://i.imgur.com/example.png)

## Features

- **Interactive Editor:** Write your MiniMacro code with line numbers and syntax styling.
- **Pass 1 Processing:** Generates the Macro Name Table (MNT), Macro Definition Table (MDT), and intermediate code.
- **Pass 2 Processing:** Expands macros using parameters and replaces formal parameters with actual arguments.
- **Error Handling:** Robust error reporting for issues like missing MEND, incorrect parameter counts, undefined macros, and duplicates.
- **Beautiful UI:** Modern, dark-themed, compiler-style interface inspired by modern developer tools.

## Prerequisites

- Node.js (v18+)
- Python (v3.8+)

## Installation & Setup

Follow these steps to run the application locally.

### 1. Setup Backend (Flask API)

Open a terminal and navigate to the `server` directory:

```bash
cd server
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```
*The server will run on http://localhost:5000*

### 2. Setup Frontend (React + Vite)

Open a new terminal and navigate to the `client` directory:

```bash
cd client
```

Install the NPM dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```
*The React app will usually be available at http://localhost:5173*

## Usage

1. Open the frontend URL in your browser.
2. The editor comes pre-filled with a sample MiniMacro program.
3. Click **Pass 1** to process the macro definitions. This will populate the **MNT** and **MDT** tables and show the **Intermediate Code**.
4. Click **Pass 2** to expand the macro calls into the final **Expanded Code**.
5. You can introduce errors (e.g., removing a \`MEND\`, removing a parameter) to see the error handling in action.

## Folder Structure

\`\`\`text
.
├── client/                 # React + Vite frontend
│   ├── package.json
│   ├── src/                # UI Components and styles
│   └── ...
├── server/                 # Python Flask backend
│   ├── app.py              # Main API entry
│   ├── processor/          # Core SPCC Logic
│   │   ├── pass1.py
│   │   ├── pass2.py
│   │   └── errors.py
│   ├── requirements.txt
│   └── ...
└── README.md
\`\`\`
