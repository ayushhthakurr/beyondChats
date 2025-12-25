const express = require('express');
const cors = require('cors');
const articleRoutes = require('./routes/articles');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BeyondChats API is running' });
});

app.use('/api', articleRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

