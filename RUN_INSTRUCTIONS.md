# SmartBank - Real-Time Banking Application
## Run Instructions

This project requires **Node.js** (v18+) and **MongoDB** installed and running locally.

### 1. Database Setup
Ensure that MongoDB is running on your machine on the default port (`localhost:27017`). 
The backend will automatically connect to `mongodb://localhost:27017/smartbank`.

### 2. Running the Backend
Open a terminal and run the following commands:
```bash
cd c:\Users\RHENIUS\OneDrive\Desktop\Design\backend
npm install
npm run dev
```
The node server should start and display:
`Server running on port 5000`
`MongoDB connected successfully`

### 3. Running the Frontend
Open a **new** terminal and run the following commands:
```bash
cd c:\Users\RHENIUS\OneDrive\Desktop\Design\frontend
npm install
npm run dev
```
The Vite React app should start on `http://localhost:5173`.

### 4. Testing the Application
1. Open your browser to `http://localhost:5173`.
2. Register a new user (e.g., "Alice"). You'll be given a $1,000 opening balance.
3. Open an Incognito Window or another browser and navigate to the same URL.
4. Register a second user (e.g., "Bob").
5. From Alice's window, navigate to **Send Money**, select "Bob", enter an amount, and click Send.
6. Look at Bob's window. The balance will update **instantly in real-time** via Socket.io without refreshing the page!

### Important Note
Because `npm` might not be globally installed via PowerShell on this remote environment, please run the `npm install` manually in your actual command prompt or terminal if you encounter script execution policies.
