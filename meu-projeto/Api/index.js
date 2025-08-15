const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// Middleware para servir HTML, CSS e JS da pasta "public"
app.use(express.static("public"));
app.use(express.json());

// Conexão com o PostgreSQL
const conexao = new Pool({
  host: "localhost",
  user: "postgres",
  password: "bianca1234",
  database: "nodegui",
  port: 5432,
});

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`Método: ${req.method} | Rota: ${req.url}`);
  next();
});

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Listar usuários
app.get("/usuario", async (req, res) => {
  try {
    const { rows } = await conexao.query("SELECT * FROM usuario ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Cadastrar usuário
app.post("/usuario", async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios" });
  }

  try {
    await conexao.query(
      "INSERT INTO usuario (nome, email) VALUES ($1, $2)",
      [nome, email]
    );
    res.json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao inserir usuário:", err);
    res.status(500).json({ error: "Erro ao cadastrar usuário" });
  }
});

// Atualizar usuário
app.put("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios" });
  }

  try {
    await conexao.query(
      "UPDATE usuario SET nome = $1, email = $2 WHERE id = $3",
      [nome, email, id]
    );
    res.json({ message: "Usuário atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// Excluir usuário
app.delete("/usuario/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await conexao.query("DELETE FROM usuario WHERE id = $1", [id]);
    res.json({ message: "Usuário excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir usuário:", err);
    res.status(500).json({ error: "Erro ao excluir usuário" });
  }
});

// Inicia o servidor e cria a tabela se não existir
app.listen(3000, async () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");

  try {
    await conexao.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT NOT NULL
      )
    `);
    console.log("📦 Tabela 'usuario' pronta!");
  } catch (err) {
    console.error("❌ Erro ao criar tabela:", err);
  }
});
