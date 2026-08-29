const express = require('express');
const cors = require('cors');
const db = require('./database')
const { startChecker } = require('./checker');

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json());

app.post('/urls', (req, res) => {
  const { url, interval} = req.body;

  if(!url || !interval){
    return res.status(400).json({ error: "URL and Interval are required"});
  }

  try{
    const now = new URL(url);
    if(now.protocol !=="https:" && now.protocol !=="http:"){
      return res.status(400).json({error: "URL must have protocol HTTP or HTTPS"})
    }
    if(!now.hostname.includes(".")){
      return res.status(400).json({error:"Please enter a valid URL with a proper domain"})
    }
  }
  catch{
      return res.status(400).json({error: "Invalid URL format"})
  }
  const a = db.prepare("INSERT INTO urls(url, interval) VALUES (?,?)");
  const result = a.run(url, interval);

  res.status(201).json({ id: result.lastInsertRowid, url, interval});
})

app.get('/urls', (req, res) => {
  const urls = db.prepare("SELECT * FROM urls").all();
  res.json(urls);

})

app.get('/urls/:id/checks', (req,res) => {
  const { id } = req.params;
  const checks = db.prepare("SELECT * FROM checks WHERE url_id = ? ORDER BY checked_at DESC").all(id);
  res.json(checks)
})

app.delete('/urls/:id', (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM checks WHERE url_id = ?").run(id);
  db.prepare("DELETE FROM urls WHERE id = ?").run(id);
  res.json({message: "URL removed successfully"})
})


startChecker();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;