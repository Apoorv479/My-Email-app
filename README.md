
# Node.js Email Server and Webmail Client

## Project Description

This project is a full-stack email solution that implements a custom SMTP server for receiving emails, a MongoDB database for persistence, an Express.js REST API for data management, and a React-based frontend for the user interface. The system allows users to receive emails via standard SMTP protocols, view them in a web interface, delete messages, and send/reply to emails using a relay service (Nodemailer).

## Architecture

The system consists of three main components:

1.  **SMTP Server (Backend):** Listens on Port 2525. It accepts incoming TCP connections using the SMTP protocol, parses the raw data stream using `mailparser`, and stores the structured data in MongoDB.
2.  **HTTP API (Backend):** Listens on Port 5000. It serves as the bridge between the database and the frontend, providing endpoints to fetch, delete, and send emails.
3.  **Web Client (Frontend):** A React application (served via Vite) that provides a graphical user interface for the inbox, email reading pane, and composition modal.

**Data Flow:**

- **Receiving:** External Client -> SMTP Port 2525 -> Stream Parser -> MongoDB.
- **Viewing:** React Client -> HTTP GET /api/emails -> MongoDB -> JSON Response.
- **Sending:** React Client -> HTTP POST /api/send -> Nodemailer -> External SMTP Relay (e.g., Gmail).

## Key Features

- **Custom SMTP Implementation:** Built using `smtp-server` to handle low-level protocol handshakes.
- **Email Parsing:** Converts raw MIME data streams into readable JSON objects (Subject, Body, From, Date).
- **Cloud Persistence:** Stores all email metadata and content in MongoDB Atlas.
- **Real-time Polling:** The frontend automatically refreshes the inbox state every 5 seconds.
- **Email Composition:** Support for sending new emails and replying to existing threads.
- **Email Management:** Functionality to delete emails from the database.
- **Modern UI:** Responsive 3-column layout styled with CSS following Material Design principles.

## Tech Stack

- **Runtime:** Node.js
- **Backend Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Frontend Library:** React (Vite build tool)
- **Core Libraries:**
  - `smtp-server`: SMTP protocol handling.
  - `mailparser`: MIME data parsing.
  - `nodemailer`: Outbound email transmission.
  - `cors`: Cross-Origin Resource Sharing.
  - `dotenv`: Environment variable management.

## Prerequisites

Ensure the following are installed on your system:

- Node.js (v18.0.0 or higher)
- npm (Node Package Manager)
- A MongoDB Atlas account (or local MongoDB instance)
- A Gmail account with an App Password (for outbound email functionality)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Apoorv479/My-Email-app.git
cd email-server
```


### 2. Backend Setup

Install the necessary server-side dependencies.

```bash
npm install

```

Create a `.env` file in the root directory and configure the following variables:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/my_email_server

```

_Note: For email sending, the Gmail credentials are currently hardcoded in `index.js` but should ideally be moved here._

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies.

```bash
cd my-webmail
npm install

```

## Usage

### 1. Start the Backend Server

This command starts both the SMTP server (Port 2525) and the HTTP API (Port 5000). From the root directory:

```bash
node index.js

```

### 2. Start the Frontend Client

In a separate terminal window, navigate to the frontend directory and start the development server:

```bash
cd my-webmail
npm run dev

```

Access the web interface at `http://localhost:5173`.

### 3. Sending a Test Email (Optional)

To test the receiving capability without an external mail client, run the provided script in a third terminal:

```bash
node send_email.js

```

## Project Structure

```text
/
├── index.js                # Main entry point (SMTP Server, Express API, DB Connection)
├── send_email.js           # Utility script for testing SMTP reception
├── .env                    # Environment variables (excluded from source control)
├── package.json            # Backend dependencies
├── node_modules/           # Backend library files
└── my-webmail/             # Frontend React Application
    ├── index.html          # HTML entry point
    ├── vite.config.js      # Vite configuration
    ├── package.json        # Frontend dependencies
    ├── src/
    │   ├── main.jsx        # React DOM root
    │   ├── App.jsx         # Main React Component (UI Logic, State, API calls)
    │   └── App.css         # Styling (Material Design implementation)

```

## API Endpoints

The backend exposes the following RESTful endpoints on Port 5000:

| Method     | Endpoint          | Description                                             | Request Body                                       |
| ---------- | ----------------- | ------------------------------------------------------- | -------------------------------------------------- |
| **GET**    | `/api/emails`     | Retrieve all stored emails sorted by date (descending). | N/A                                                |
| **POST**   | `/api/send`       | Send an email via the configured SMTP relay.            | `{ "to": "...", "subject": "...", "body": "..." }` |
| **DELETE** | `/api/emails/:id` | Permanently delete an email by its MongoDB ID.          | N/A                                                |

```

```
