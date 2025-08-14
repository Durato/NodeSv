const express = require("express");
const { Pool } = require("pg");

const app = express();
const conexao = new Pool({
  host: "localhost",
  user: "postgres",
  password: "bianca1234",
  database: "nodegui",
  port: 5432,
});

app.use((req, res, next) => {
  console.log(`Método: ${req.method}, Rota: ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Olá, mundo!");
});

app.get("/usuario", async (req, res) => {
  const { rows } = await conexao.query("SELECT * FROM usuario");
  res.json(rows);
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

async function init() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS usuario (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL
    )`
  ];

  for (const query of queries) {
    await conexao.query(query);
  }

  await conexao.query(
    'INSERT INTO usuario(nome, email) VALUES ($1, $2)',
    ['João', 'joao@email.com']
  );

  const { rows } = await conexao.query('SELECT * FROM usuario');
  console.log(rows);
}

init();
