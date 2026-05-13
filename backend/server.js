const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/discrete-math', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const LogicSchema = new mongoose.Schema({
  userId: String,          // ID користувача
  type: String,            // тип дії (bfs, dfs і т.д.)
  expression: String,      // вхідні дані (input)
  result: String,          // результат дії
  timestamp: { type: Date, default: Date.now },
});

const Logic = mongoose.model('Logic', LogicSchema);

// Додати запис в історію користувача
app.post('/api/logic', async (req, res) => {
  const { userId, type, expression, result } = req.body;
  try {
    const saved = await Logic.create({ userId, type, expression, result });
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отримати історію користувача, відсортовану за датою (новіші спочатку)
app.get('/api/logic/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await Logic.find({ userId }).sort({ timestamp: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Очистити історію користувача
app.delete('/api/logic/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await Logic.deleteMany({ userId });
    res.json({ message: 'Історія очищена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('✅ Server started on http://localhost:5000');
});
