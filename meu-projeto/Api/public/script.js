const form = document.getElementById("formCadastro");
const tabela = document.getElementById("tabelaUsuarios").querySelector("tbody");
const mensagem = document.getElementById("mensagem");
const buscaInput = document.getElementById("buscaInput");

// Função para carregar usuários do backend
async function carregarUsuarios() {
  try {
    const resposta = await fetch("/usuario");
    const usuarios = await resposta.json();

    tabela.innerHTML = ""; // limpa tabela antes de preencher

    usuarios.forEach((user) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.nome}</td>
        <td>${user.email}</td>
        <td>
          <button class="editar" data-id="${user.id}">Editar</button>
          <button class="excluir" data-id="${user.id}">Excluir</button>
        </td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
  }
}

// Cadastrar usuário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();

  if (!nome || !email) {
    mensagem.textContent = "Por favor, preencha todos os campos.";
    mensagem.style.color = "red";
    return;
  }

  try {
    const resposta = await fetch("/usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email })
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      mensagem.textContent = resultado.message || "Usuário cadastrado com sucesso!";
      mensagem.style.color = "green";
      form.reset();
      carregarUsuarios(); // atualiza a tabela
    } else {
      mensagem.textContent = resultado.error || "Erro ao cadastrar.";
      mensagem.style.color = "red";
    }
  } catch (err) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.style.color = "red";
  }
});

// Buscar usuários na tabela
buscaInput.addEventListener("input", () => {
  const filtro = buscaInput.value.toLowerCase();
  Array.from(tabela.rows).forEach((row) => {
    const nome = row.cells[0].textContent.toLowerCase();
    row.style.display = nome.includes(filtro) ? "" : "none";
  });
});

// Delegação de eventos para editar e excluir
tabela.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  // Excluir usuário
  if (e.target.classList.contains("excluir")) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await fetch(`/usuario/${id}`, { method: "DELETE" });
        carregarUsuarios();
      } catch (err) {
        console.error("Erro ao excluir usuário:", err);
      }
    }
  }

  // Editar usuário
  if (e.target.classList.contains("editar")) {
    const nomeAtual = e.target.parentElement.parentElement.cells[0].textContent;
    const emailAtual = e.target.parentElement.parentElement.cells[1].textContent;

    const novoNome = prompt("Editar nome:", nomeAtual);
    const novoEmail = prompt("Editar email:", emailAtual);

    if (novoNome && novoEmail) {
      try {
        await fetch(`/usuario/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome: novoNome, email: novoEmail })
        });
        carregarUsuarios();
      } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
      }
    }
  }
});

// Carrega os usuários quando a página abre
carregarUsuarios();
