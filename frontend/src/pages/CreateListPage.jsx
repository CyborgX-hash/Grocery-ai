import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, ArrowRight, AlertCircle, Wand2 } from 'lucide-react';
import { api } from '../services/api';
import AIProcessing from '../components/AIProcessing';

const DEMO_PROMPT = `bhai milk le aana
bread bhi
brown wali
eggs bhi khatam hai
actually Rahul eggs la raha
atta bhi le aa 5kg wala
aur wahi chips jo last time liye the`;

export default function CreateListPage({ onParsedComplete, initialDemo = false }) {
  const [messages, setMessages] = useState(initialDemo ? DEMO_PROMPT : '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialDemo) {
      setMessages(DEMO_PROMPT);
    }
  }, [initialDemo]);

  const handleFillDemo = () => {
    setMessages(DEMO_PROMPT);
    setError(null);
  };

  const handleClear = () => {
    setMessages('');
    setError(null);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!messages.trim()) {
      setError('Please paste or type your roommate messages first.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Add slight delay so the step-by-step cognitive animation is appreciated
      const [parsedData] = await Promise.all([
        api.parseMessages(messages),
        new Promise((resolve) => setTimeout(resolve, 1800)),
      ]);

      if (!parsedData || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
        throw new Error("Couldn't find any grocery items in that message. Try adding a bit more detail.");
      }

      onParsedComplete(parsedData);
    } catch (err) {
      console.error('Error during AI parsing:', err);
      setError(err.message || "Couldn't understand that request. Try adding a little more detail.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <AIProcessing />;
  }

  return (
    <div className="fade-in" style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
          Create Grocery List
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Paste raw WhatsApp chats, voice-to-text transcripts, or chaotic Hinglish bullet points from your roommate.
        </p>
      </div>

      <div className="card">
        {/* Quick Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Roommate Message Dump
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-secondary btn-sm"
              id="fill-demo-btn"
              title="Fill with realistic chaotic roommate text"
            >
              <Wand2 size={13} color="var(--accent-primary)" />
              <span>Fill Realistic Demo</span>
            </button>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-ghost btn-sm"
                id="clear-input-btn"
                title="Clear input"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            className="textarea"
            rows={8}
            placeholder={`bhai milk le aana\nbread bhi\nbrown wali\neggs bhi khatam hai\nactually Rahul eggs la raha\natta bhi le aa 5kg wala`}
            value={messages}
            onChange={(e) => {
              setMessages(e.target.value);
              if (error) setError(null);
            }}
            id="roommate-messages-input"
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '0.4rem 0.2rem',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <span>{messages.length} characters</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--badge-cancelled-bg)',
              color: 'var(--badge-cancelled-text)',
              border: '1px solid var(--badge-cancelled-border)',
              marginTop: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button
            onClick={handleGenerate}
            disabled={!messages.trim()}
            className="btn btn-primary btn-lg"
            id="generate-list-btn"
            style={{ width: '100%' }}
          >
            <Sparkles size={18} />
            <span>Generate Smart List with AI</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Helpful Tips */}
      <div
        style={{
          marginTop: '1.75rem',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>💡 Pro-Tip for Demo: </span>
        Notice how MessyList figures out that "brown wali" refers to Bread, automatically cancels Eggs because Rahul is bringing them, sets Atta to 5kg, and applies your stored brand preferences!
      </div>
    </div>
  );
}
