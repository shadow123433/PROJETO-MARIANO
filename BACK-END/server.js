// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// MIDDLEWARES
// ========================

// Parse JSON requests
app.use(bodyParser.json());

// Parse URL-encoded requests (form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// ROTAS
// ========================

// Rota principal - serve o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API de exemplo - produtos
app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: "Produto A", price: 10.0, stock: 5 },
    { id: 2, name: "Produto B", price: 20.0, stock: 2 },
    { id: 3, name: "Produto C", price: 15.0, stock: 0 }
  ];
  res.json(products);
});

// API para receber pedidos
app.post('/api/orders', (req, res) => {
  const order = req.body;
  console.log("Nova ordem recebida:", order);

  // Aqui você pode salvar no banco de dados depois
  res.status(201).json({ message: "Ordem recebida com sucesso!", order });
});

// Catch-all para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========================
// INICIAR SERVIDOR
// ========================
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
