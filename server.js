const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Usa a porta do ambiente (para hospedagem)
const scriptsFile = path.join(__dirname, 'scripts.json');

// Middleware
app.use(cors({ origin: '*' })); // Permite requisições de qualquer origem
app.use(express.json());

// Inicializa o arquivo scripts.json se não existir
async function initializeScriptsFile() {
  try {
    await fs.access(scriptsFile);
  } catch {
    await fs.writeFile(scriptsFile, JSON.stringify([]));
  }
}
initializeScriptsFile();

// GET /scripts - Retorna todos os scripts
app.get('/scripts', async (req, res) => {
  try {
    const data = await fs.readFile(scriptsFile);
    const scripts = JSON.parse(data);
    res.json(scripts);
  } catch (error) {
    console.error('Erro ao ler scripts:', error);
    res.status(500).json({ error: 'Erro ao carregar scripts' });
  }
});

// POST /scripts - Adiciona um novo script
app.post('/scripts', async (req, res) => {
  const { password, name, description, download_url, image_url } = req.body;

  // Verifica a senha
  if (password !== '24001234') {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  if (!name || !description || !download_url || !image_url) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const data = await fs.readFile(scriptsFile);
    const scripts = JSON.parse(data);
    const newScript = {
      id: scripts.length ? scripts[scripts.length - 1].id + 1 : 1,
      name,
      description,
      download_url,
      image_url,
      created_at: new Date().toISOString()
    };
    scripts.push(newScript);
    await fs.writeFile(scriptsFile, JSON.stringify(scripts, null, 2));
    res.json({ message: 'Script publicado com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar script:', error);
    res.status(500).json({ error: 'Erro ao salvar script' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
