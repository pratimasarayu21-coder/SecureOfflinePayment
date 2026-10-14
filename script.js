
const DEFAULT_BALANCES = {
    Alice: 500,
    Bob: 200
};

function loadBalances() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("securepay_balances")
        );

        if (
            saved &&
            Number.isFinite(saved.Alice) &&
            Number.isFinite(saved.Bob) &&
            saved.Alice >= 0 &&
            saved.Bob >= 0
        ) {
            return saved;
        }
    } catch (error) {
        console.warn("Could not load saved balances.");
    }

    return { ...DEFAULT_BALANCES };
}

function loadTransactions() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("securepay_transactions")
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        return [];
    }
}

const balances = loadBalances();
const transactions = loadTransactions();
let transactionNumber = transactions.length + 1;

const form = document.getElementById("paymentForm");
const senderInput = document.getElementById("sender");
const receiverInput = document.getElementById("receiver");
const amountInput = document.getElementById("amount");
const message = document.getElementById("message");

function saveData() {
    localStorage.setItem(
        "securepay_balances",
        JSON.stringify(balances)
    );

    localStorage.setItem(
        "securepay_transactions",
        JSON.stringify(transactions)
    );
}

function updateBalances() {
    document.getElementById("aliceBalance").textContent =
        `₹${balances.Alice.toFixed(2)}`;

    document.getElementById("bobBalance").textContent =
        `₹${balances.Bob.toFixed(2)}`;
}

function renderTransactions() {
    const list = document.getElementById("transactionList");
    const count = document.getElementById("transactionCount");

    count.textContent =
        `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;

    if (transactions.length === 0) {
        list.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No transactions yet. Make your first demo payment!
                </td>
            </tr>`;
        return;
    }

    list.replaceChildren();

    for (const tx of [...transactions].reverse()) {
        const row = document.createElement("tr");

        for (const value of [
            tx.id,
            tx.sender,
            tx.receiver,
            `₹${Number(tx.amount).toFixed(2)}`,
            "Demo recorded"
        ]) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        }

        list.appendChild(row);
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const sender = senderInput.value;
    const receiver = receiverInput.value;
    const amount = Number(amountInput.value);

    if (sender === receiver) {
        message.textContent = "Choose two different wallets.";
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        Math.round(amount * 100) !== amount * 100
    ) {
        message.textContent =
            "Enter a positive amount with at most two decimal places.";
        return;
    }

    if (amount > balances[sender]) {
        message.textContent =
            "Payment rejected: insufficient demo balance.";
        return;
    }

    balances[sender] = Number(
        (balances[sender] - amount).toFixed(2)
    );

    balances[receiver] = Number(
        (balances[receiver] + amount).toFixed(2)
    );

    transactions.push({
        id: `DEMO-${Date.now()}-${transactionNumber++}`,
        sender,
        receiver,
        amount,
        createdAt: new Date().toISOString()
    });

    saveData();
    updateBalances();
    renderTransactions();

    message.textContent =
        `Demo payment recorded: ₹${amount.toFixed(2)} from ${sender} to ${receiver}.`;

    amountInput.value = "";
});

updateBalances();
renderTransactions();
