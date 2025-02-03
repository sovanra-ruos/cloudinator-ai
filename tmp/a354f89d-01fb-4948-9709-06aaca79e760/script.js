import React from 'react';
import ReactDOM from 'react-dom/client';
import { CodeGenerator } from './components/CodeGenerator'; // Adjust path if necessary

function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Gemini Code Generator</h1>
        <CodeGenerator />
      </div>
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
