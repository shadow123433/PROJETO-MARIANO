// --- BANCO DE DADOS (LOCALSTORAGE) ---
let db = {
    products: JSON.parse(localStorage.getItem('mariano_products')) || [],
    clients: JSON.parse(localStorage.getItem('mariano_clients')) || [],
    sales: JSON.parse(localStorage.getItem('mariano_sales')) || [],
    os: JSON.parse(localStorage.getItem('mariano_os')) || [],
    cart: []
};

// --- NAVEGAÇÃO ---
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    // Atualiza dados ao mudar de tela
    refreshTables();
    updateDashboard();
}

function saveData() {
    localStorage.setItem('mariano_products', JSON.stringify(db.products));
    localStorage.setItem('mariano_clients', JSON.stringify(db.clients));
    localStorage.setItem('mariano_sales', JSON.stringify(db.sales));
    localStorage.setItem('mariano_os', JSON.stringify(db.os));
    refreshTables();
    updateDashboard();
}

// --- ESTOQUE ---
function addProduct() {
    const code = document.getElementById('prod-code').value;
    const name = document.getElementById('prod-name').value;
    const qty = parseInt(document.getElementById('prod-qty').value);
    const price = parseFloat(document.getElementById('prod-price').value);

    if (!code || !name) return alert("Preencha todos os campos");

    db.products.push({code, name, qty, price});
    saveData();
    alert("Produto cadastrado!");

    // Limpar campos
    document.getElementById('prod-code').value = '';
    document.getElementById('prod-name').value = '';
}

function renderStock() {
    const tbody = document.querySelector('#stock-table tbody');
    tbody.innerHTML = '';
    db.products.forEach((p, index) => {
        let row = `<tr>
            <td>${p.code}</td>
            <td>${p.name}</td>
            <td>${p.qty} <span style="color:${p.qty < 5 ? 'red' : 'green'}">${p.qty < 5 ? '(Baixo)' : ''}</span></td>
            <td>R$ ${p.price.toFixed(2)}</td>
            <td><button onclick="deleteProduct(${index})" style="color:red; border:none; background:none; cursor:pointer;">Excluir</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });

    // Atualiza select de produtos na venda
    const select = document.getElementById('sale-prod-select');
    if (select) {
        select.innerHTML = '';
        db.products.forEach((p, index) => {
            select.innerHTML += `<option value="${index}">${p.name} (R$ ${p.price}) - Est: ${p.qty}</option>`;
        });
    }
}

function deleteProduct(index) {
    if (confirm('Tem certeza?')) {
        db.products.splice(index, 1);
        saveData();
    }
}

// --- CLIENTES ---
function addClient() {
    const client = {
        name: document.getElementById('cli-name').value,
        cpf: document.getElementById('cli-cpf').value,
        phone: document.getElementById('cli-phone').value,
        address: document.getElementById('cli-address').value,
        rg: document.getElementById('cli-rg').value,
        father: document.getElementById('cli-father').value,
        mother: document.getElementById('cli-mother').value,
        civil: document.getElementById('cli-civil').value,
        loyalty: 'Novo'
    };

    if (!client.name) return alert("Nome é obrigatório");

    db.clients.push(client);
    saveData();
    alert("Cliente salvo!");
}

function renderClients() {
    const tbody = document.querySelector('#clients-table tbody');
    tbody.innerHTML = '';
    db.clients.forEach(c => {
        tbody.innerHTML += `<tr>
            <td>${c.name}</td>
            <td>${c.address}</td>
            <td>${c.phone}</td>
            <td>${c.cpf}</td>
            <td><button>Ver Detalhes</button></td>
        </tr>`;
    });

    // Atualiza selects de clientes
    const selects = [document.getElementById('sale-client-select'), document.getElementById('os-client-select')];
    selects.forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '<option value="Balcao">Consumidor Balcão</option>';
        db.clients.forEach(c => {
            sel.innerHTML += `<option value="${c.name}">${c.name}</option>`;
        });
    });
}

// --- VENDAS ---
function addToCart() {
    const prodIndex = document.getElementById('sale-prod-select').value;
    const qty = parseInt(document.getElementById('sale-qty').value);

    if (db.products.length === 0) return alert("Sem produtos cadastrados");

    const product = db.products[prodIndex];

    if (product.qty < qty) return alert("Estoque insuficiente!");

    db.cart.push({
        productIndex: prodIndex,
        name: product.name,
        price: product.price,
        qty: qty,
        total: product.price * qty
    });

    renderCart();
}

function renderCart() {
    const tbody = document.querySelector('#cart-table tbody');
    tbody.innerHTML = '';
    let total = 0;

    db.cart.forEach((item, idx) => {
        total += item.total;
        tbody.innerHTML += `<tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>R$ ${item.price.toFixed(2)}</td>
            <td>R$ ${item.total.toFixed(2)}</td>
            <td><button onclick="removeFromCart(${idx})">X</button></td>
        </tr>`;
    });

    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function removeFromCart(idx) {
    db.cart.splice(idx, 1);
    renderCart();
}

function finalizeSale() {
    if (db.cart.length === 0) return alert("Carrinho vazio");

    const clientName = document.getElementById('sale-client-select').value;
    const total = parseFloat(document.getElementById('cart-total').innerText);

    // Debitar estoque
    db.cart.forEach(item => {
        db.products[item.productIndex].qty -= item.qty;
    });

    // Registrar venda
    const sale = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        client: clientName,
        items: db.cart,
        total: total
    };

    db.sales.push(sale);
    db.cart = []; // Limpa carrinho

    saveData();
    renderCart();
    alert("Venda realizada com sucesso!");
}

// --- ORDENS DE SERVIÇO ---
function addOS() {
    const os = {
        desc: document.getElementById('os-desc').value,
        client: document.getElementById('os-client-select').value,
        status: document.getElementById('os-status').value,
        value: parseFloat(document.getElementById('os-value').value) || 0,
        date: new Date().toLocaleDateString()
    };
    db.os.push(os);
    saveData();
    alert("OS Criada!");
}

function renderOS() {
    const tbody = document.querySelector('#os-table tbody');
    tbody.innerHTML = '';
    db.os.forEach(os => {
        let color = os.status === 'Pendente' ? 'orange' : (os.status === 'Concluido' ? 'green' : 'blue');
        tbody.innerHTML += `<tr>
            <td>#OS</td>
            <td>${os.client}</td>
            <td>${os.desc}</td>
            <td><span style="color:${color}">${os.status}</span></td>
            <td>R$ ${os.value.toFixed(2)}</td>
        </tr>`;
    });
}

// --- DASHBOARD E UTILS ---
function updateDailyStatus() {
    const status = document.getElementById('statusSelect').value;
    const light = document.getElementById('statusLight');
    if (status === 'parado') light.style.background = 'red';
    else if (status === 'movimentado') light.style.background = 'green';
    else light.style.background = 'orange';
}

function updateDashboard() {
    // Vendas hoje
    const today = new Date().toLocaleDateString();
    const salesToday = db.sales.filter(s => s.date === today).reduce((acc, s) => acc + s.total, 0);
    document.getElementById('dash-sales-today').innerText = `R$ ${salesToday.toFixed(2)}`;

    // Contadores
    document.getElementById('dash-clients').innerText = db.clients.length;
    const lowStock = db.products.filter(p => p.qty < 5).length;
    document.getElementById('dash-low-stock').innerText = `${lowStock} itens`;

    // Relatórios Totais
    const totalSales = db.sales.reduce((acc, s) => acc + s.total, 0);
    const totalOS = db.os.reduce((acc, s) => acc + s.value, 0);
    document.getElementById('rep-total-sales').innerText = `R$ ${totalSales.toFixed(2)}`;
    document.getElementById('rep-total-os').innerText = `R$ ${totalOS.toFixed(2)}`;
}

function refreshTables() {
    renderStock();
    renderClients();
    renderOS();
}

function clearAllData() {
    if (confirm("ATENÇÃO: Isso apagará TUDO. Continuar?")) {
        localStorage.clear();
        location.reload();
    }
}

// Inicialização ao carregar a página
window.onload = function () {
    refreshTables();
    updateDashboard();
};