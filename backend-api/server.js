const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const port = 8888;

app.use(express.json());
app.use(cors());

try {
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase works!');

} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK.', error);
  process.exit(1); 
}

const db = admin.firestore();

app.get('/api/notes', async (req, res) => {
  try {
    const notesRef = db.collection('notes');
    const snapshot = await notesRef.get();
    
    const notes = [];
    snapshot.forEach(doc => {
      notes.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).send('Error fetching notes');
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { Title, Content, Author, isAllCaps } = req.body;
    
    const newNote = {
      Title,
      Content,
      Author: Author || 'Unknown',
      isAllCaps: isAllCaps || false
    };

    const docRef = await db.collection('notes').add(newNote);
    
    res.status(201).json({ id: docRef.id, ...newNote });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).send('Error adding note');
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { Title, Content, Author, color } = req.body;
    
    const updateData = {};
    if (Title !== undefined) updateData.Title = Title;
    if (Content !== undefined) updateData.Content = Content;
    if (Author !== undefined) updateData.Author = Author;
    if (color !== undefined) updateData.color = color;
    
    await db.collection('notes').doc(noteId).update(updateData);
    
    res.status(200).send({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).send('Error updating note');
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    await db.collection('notes').doc(noteId).delete();
    
    res.status(200).send({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send('Error deleting note');
  }
});

app.get('/api/status', (req, res) => {
  res.status(200).json({ message: 'API is running successfully!' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
