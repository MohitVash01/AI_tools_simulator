const express = require('express');
const cors = require("cors");
const app = express(); 
app.use(cors());
const PORT = 3001;


const tools = require('./ai_tools_sample_data.json');
const favorites = new Set();
app.use(express.json());



// GET all tools or filter by category
app.get('/api/tools', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filtered = tools.filter(tool => tool.category.toLowerCase() === category.toLowerCase());
    return res.json(filtered); // Return empty array if none match
  }
  res.json(tools);
});



// GET all favorites
app.get('/api/favorites', (req, res) => {
  const favList = tools.filter(tool => favorites.has(tool.id));
  res.json(favList);
});



// POST to add favorite
app.post('/api/favorites', (req, res) => {
  const { toolId } = req.body;
  const exists = tools.find(t => t.id === toolId);

  if (!exists) {
    return res.status(404).json({ message: 'Tool not found' });
  }
  if (favorites.has(toolId)) {
    return res.status(409).json({ message: 'Tool already in favorites' });
  }

  favorites.add(toolId);
  res.status(201).json({ message: 'Tool added to favorites' });
});

// DELETE /api/favorites/:id
// router.delete('/favorites/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     await Favorite.deleteOne({ toolId: id }); // Adjust this if you store toolId differently
//     res.json({ message: 'Removed from favorites' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to remove favorite' });
//   }
// });

app.delete('/api/favorites/:id', (req, res) => {
  const toolId = parseInt(req.params.id, 10);
  if (!favorites.has(toolId)) {
    return res.status(404).json({ message: 'Favorite not found' });
  }

  favorites.delete(toolId);
  res.json({ message: 'Removed from favorites' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
