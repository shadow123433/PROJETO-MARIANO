document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-example");
  const inputProduto = document.getElementById("produto");
  const inputQuantidade = document.getElementById("quantidade");
  const btnCancelar = modal.querySelector(".btn-outline");
  const btnFechar = modal.querySelector(".modal-close");
  const formModal = modal.querySelector("form");
  let linhaAtual = null;

  // ===== Abrir Modal =====
  function abrirModal(tr) {
    linhaAtual = tr;
    const tdProduto = tr.children[0].textContent;
    const tdQuantidade = tr.children[2].textContent;

    inputProduto.value = tdProduto;
    inputQuantidade.value = tdQuantidade;

    modal.classList.add("active");
  }

  function fecharModal() {
    modal.classList.remove("active");
    linhaAtual = null;
  }

  btnCancelar.addEventListener("click", fecharModal);
  btnFechar.addEventListener("click", fecharModal);

  // ===== Botões Editar =====
  document.querySelectorAll(".btn-ghost").forEach(btn => {
    btn.addEventListener("click", e => {
      const tr = e.target.closest("tr");
      abrirModal(tr);
    });
  });

  // ===== Botões Excluir =====
  document.querySelectorAll(".btn-danger").forEach(btn => {
    btn.addEventListener("click", e => {
      const tr = e.target.closest("tr");
      if (confirm("Deseja realmente excluir este produto?")) {
        tr.remove();
      }
    });
  });

  // ===== Salvar Modal =====
  formModal.addEventListener("submit", e => {
    e.preventDefault();
    if (!linhaAtual) return;

    linhaAtual.children[0].textContent = inputProduto.value;
    linhaAtual.children[2].textContent = inputQuantidade.value;

    fecharModal();
    mostrarToast("success", "Produto atualizado com sucesso!");
  });

  // ===== Toast =====
  function mostrarToast(tipo, mensagem) {
    const toastContainer = document.querySelector(".toast-container");
    const toast = toastContainer.querySelector(`.toast.${tipo}`);
    toast.querySelector("span").textContent = mensagem;
    toast.classList.add("active");

    setTimeout(() => {
      toast.classList.remove("active");
    }, 3000);
  }
});
