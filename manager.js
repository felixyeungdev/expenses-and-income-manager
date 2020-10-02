showdown.setOption("simpleLineBreaks", true);
var mdConverter = new showdown.Converter();

function beautifyEvent(event) {
    var eventSummary = event.summary;
    var eventSummarySplitted = eventSummary.split(" ");
    var transactionDetails = eventSummarySplitted.shift();
    var amountRaw = transactionDetails.slice(1);

    var summary = eventSummarySplitted.join(" ");
    var [currency, value] = amountRaw.split("$");
    var amount = {
        currency,
        value,
    };
    var type = transactionDetails.slice(0, 1);
    var description = event.description || "";
    var dateTime = event.start.dateTime;
    return { summary, amount, type, description, dateTime };
}

async function getCalendarId() {
    var list = await getCalendarList();
    var filtered = list.filter((l) => l.summary == "Expenses and Income");
    if (filtered.length <= 0) return;
    var id = filtered[0].id;
    return id;
}

async function managerGetEntries() {
    var id = await getCalendarId();
    var events = await getAllEvents(id);
    var entries = events.map(beautifyEvent);
    return entries.reverse();
}

function managerRenderEntry(entry) {
    var base = document.createElement("div");
    base.classList.add("entry");
    base.classList.add(entry.type == "+" ? "income" : "expense");
    var amount = document.createElement("span");
    amount.textContent = `${entry.type}${entry.amount.currency}$${entry.amount.value}`;
    amount.classList.add("amount");
    var summary = document.createElement("h3");
    summary.textContent = entry.summary;
    summary.classList.add("summary");
    var description = document.createElement("div");
    description.innerHTML = mdConverter.makeHtml(entry.description);

    base.append(amount, summary, description);

    return base;
}

function managerRenderTotal(currencies) {
    var base = document.createElement("div");
    base.classList.add("analysis");
    var md = `### Total\n`;
    for (var currency in currencies) {
        md += `**${currency}**\n`;
        md += `${currencies[currency]}\n`;
        md += "\n";
    }
    base.innerHTML = mdConverter.makeHtml(md);
    return base;
}

function managerCalculateTotal(entries = []) {
    let currencies = {};
    entries.forEach((entry) => {
        // console.log(entry);
        if (!currencies[entry.amount.currency])
            currencies[entry.amount.currency] = 0;
        if (entry.type == "+") {
            currencies[entry.amount.currency] += +entry.amount.value;
        } else if (entry.type == "-") {
            currencies[entry.amount.currency] -= +entry.amount.value;
        }
        // console.log(currencies[entry.amount.currency]);
    });
    return currencies;
}
