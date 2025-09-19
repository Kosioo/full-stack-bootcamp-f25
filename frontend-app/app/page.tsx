'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './page.module.css';

interface Note {
  id: string;
  Title: string;
  Content: string;
  Author: string;
  isAllCaps?: boolean;
  color?: string;
}


export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ Title: '', Content: '', Author: '' });
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get<Note[]>('http://localhost:8888/api/notes');
        setNotes(response.data);
      } catch (err) {
        setError('Failed to fetch notes. Is the backend server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNote(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (activeNote) {
    try {
      await axios.put(`http://localhost:8888/api/notes/${activeNote.id}`, {
        Title: newNote.Title,
        Content: newNote.Content,
        Author: newNote.Author,
      });

      setNotes(notes.map(note =>
        note.id === activeNote.id ? { ...note, ...newNote } : note
      ));

      setActiveNote(null);
      setNewNote({ Title: '', Content: '', Author: '' });

    } catch (err) {
      console.error('Failed to update note:', err);
      alert('Failed to update note. Check the console for details.');
    }

  } else {
    try {
      const response = await axios.post<Note>('http://localhost:8888/api/notes', {
        ...newNote,
        isAllCaps: false,
      });

      setNotes([...notes, response.data]);
      setNewNote({ Title: '', Content: '', Author: '' });

    } catch (err) {
      console.error('Failed to add note:', err);
      alert('Failed to add note. Check the console for details.');
    }
  }
};

  const handleDeleteNote = async (noteId: string) => {
  try {
    await axios.delete(`http://localhost:8888/api/notes/${noteId}`);
    setNotes(notes.filter(note => note.id !== noteId));
  } catch (err) {
    console.error('Failed to delete note:', err);
    alert('Failed to delete note. Check the console for details.');
  }
};

const handleEditClick = (note: Note) => {
  setActiveNote(note);
  setNewNote({
    Title: note.Title,
    Content: note.Content,
    Author: note.Author,
  });
};

const handleUpdateNote = async (noteId: string) => {
  const newColor = prompt('Enter a new color (e.g., "red", "blue", "#f0f0f0"):');
  if (!newColor) return;

  try {
    await axios.put(`http://localhost:8888/api/notes/${noteId}`, { color: newColor });
    setNotes(notes.map(note =>
      note.id === noteId ? { ...note, color: newColor } : note
    ));
  } catch (err) {
    console.error('Failed to update note:', err);
    alert('Failed to update note. Check the console for details.');
  }
};

  if (loading) {
    return <p>Loading notes...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
  <div className={styles.container}>
    <h1 className={styles.title}>My Notes App</h1>

    <form onSubmit={handleFormSubmit} className={styles.form}>
      <input
        type="text"
        name="Title"
        placeholder="Note Title"
        value={newNote.Title}
        onChange={handleInputChange}
        required
        className={styles.input}
      />
      <textarea
        name="Content"
        placeholder="Note Content"
        value={newNote.Content}
        onChange={handleInputChange}
        required
        className={styles.textarea}
      ></textarea>
      <input
        type="text"
        name="Author"
        placeholder="Author"
        value={newNote.Author}
        onChange={handleInputChange}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        {activeNote ? 'Save Changes' : 'Add Note'}
      </button>
      {activeNote && (
        <button
          type="button"
          onClick={() => {
            setActiveNote(null);
            setNewNote({ Title: '', Content: '', Author: '' });
          }}
          className={styles.button}
          style={{ backgroundColor: '#ccc', color: '#333' }} // Simple styling for cancel button
        >
          Cancel Edit
        </button>
      )}
    </form>

    <div className={styles.notesGrid}>
      {notes.length === 0 ? (
        <p>No notes found. Try adding one!</p>
      ) : (
        notes.map(note => (
          <div
            key={note.id}
            className={styles.noteCard}
            style={{ backgroundColor: note.color || 'white' }}
          >
            <h3>{note.Title}</h3>
            <p>{note.Content}</p>
            <small>By: {note.Author}</small>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleEditClick(note)}
                style={{ padding: '8px', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleUpdateNote(note.id)}
                style={{ padding: '8px', cursor: 'pointer' }}
              >
                Change Color
              </button>
              <button
                onClick={() => handleDeleteNote(note.id)}
                style={{ padding: '8px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);  
}