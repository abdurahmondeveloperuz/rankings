import express from 'express';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { validateApiKey } from './config/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Store rankings in a JSON file
const RANKINGS_FILE = join(__dirname, 'data', 'rankings.json');

// Ensure data directory exists
await fs.mkdir(join(__dirname, 'data'), { recursive: true });

// Initialize rankings file if it doesn't exist
try {
  await fs.access(RANKINGS_FILE);
} catch {
  await fs.writeFile(RANKINGS_FILE, '{}');
}

// API endpoint to edit/create ranking
app.post('/api/edit_ranking', validateApiKey, async (req, res) => {
  try {
    const { ranking_id, students } = req.body;
    
    if (!ranking_id || !students || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const rankings = JSON.parse(await fs.readFile(RANKINGS_FILE, 'utf-8'));
    
    rankings[ranking_id] = {
      id: ranking_id,
      students: students.map((student, index) => ({
        ...student,
        rank: index + 1
      })),
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(RANKINGS_FILE, JSON.stringify(rankings, null, 2));
    
    res.json({ success: true, ranking: rankings[ranking_id] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get ranking
app.get('/api/ranking/:ranking_id', async (req, res) => {
  try {
    const { ranking_id } = req.params;
    const rankings = JSON.parse(await fs.readFile(RANKINGS_FILE, 'utf-8'));
    
    if (!rankings[ranking_id]) {
      return res.status(404).json({ error: 'Ranking not found' });
    }
    
    res.json(rankings[ranking_id]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Serve the rankings page
app.get('/rankings/:ranking_id', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'rankings.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});