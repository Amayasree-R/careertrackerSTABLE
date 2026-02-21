# Skill Career Tracker 🚀

A comprehensive MERN stack application designed to help users track their career progression, analyze skill gaps, and certify their mastery through AI-generated quizzes.

## ✨ Features

- **Skill Gap Analysis**: Compare your current skills against target job requirements.
- **Interactive Roadmap**: Visualize your learning path with a dynamic graph.
- **Skill Certification**:
  - **AI-Powered Quizzes**: Take generated tests for any skill to prove mastery.
  - **Fallback Mode**: Includes a default quiz system if AI services are unavailable.
  - **Celebration Effects**: Visual rewards upon passing a certification.
- **User Dashboard**: Track "To Learn", "Learning", and "Mastered" skills.
- **Profile Management**: Update your experience level and target role.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **AI Integration**: Groq SDK (Llama 3.3 70b) for generating quizzes and roadmaps.

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)
- Groq API Key (for AI features)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd career-tracker/careerpath/skill-career-tracker
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    ```

### Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=optional_github_token_for_skill_fetching
```

### Running the Application

1.  **Start the Backend Server**:
    ```bash
    # In the server directory
    node index.js
    # OR for development with auto-reload
    npm run dev
    ```

2.  **Start the Frontend**:
    ```bash
    # In the root project directory
    npm run dev
    ```

3.  **Access the App**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📝 Usage Guide

1.  **Sign Up/Login**: Create an account to save your progress.
2.  **Create Profile**: Enter your current skills (e.g., HTML, CSS) and target job (e.g., Frontend Developer).
3.  **View Dashboard**: See your skill gaps and roadmap.
4.  **Start Learning**: Click a skill card to move it to "Learning".
5.  **Take Quiz**: Click a "Learning" skill to take a quiz.
    - Pass (>90%) to mark it as **Mastered**.
    - Fail? Keep learning and try again!

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
