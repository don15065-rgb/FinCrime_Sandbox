/*
  FinCrime Simulator
  Vanilla JavaScript educational AML/KYC simulator.
  Everything is fictional and stored locally in the browser.
*/

const progressDefaults = {
  casesCompleted: 0,
  totalScore: 0,
  attempts: 0,
  highRiskFound: 0,
  sqlAttempted: 0,
  badges: []
};

let progress = loadProgress();
let currentKyc = 0;
let currentMonitoring = 0;

const kycCases = [
  {
    name: "Ahmed Global Traders",
    difficulty: "Intermediate",
    type: "Business",
    activity: "Import/export of electronics",
    countryExposure: "Pakistan, UAE, China, Afghanistan",
    expectedTurnover: "PKR 2.5M/month",
    actualActivity: "PKR 13.8M/month with frequent overseas wires",
    pep: "No known PEP link",
    adverseMedia: "One local article alleging counterfeit imports; unverified",
    documents: "CNIC and NTN provided; business registration and supplier contracts missing",
    sourceFunds: "Stated business revenue; no invoices or audited accounts provided",
    accountAge: "4 months",
    behaviour: "Sudden increase in international transfers after low initial activity",
    expectedRisk: "High",
    expectedDecision: "Escalate",
    redFlags: ["Activity inconsistent with profile", "Missing source of funds", "High-risk jurisdiction exposure", "Adverse media"],
    missingDocs: ["Business registration", "Supplier invoices", "Source of funds evidence"],
    note: "Customer activity materially exceeds declared turnover and includes cross-border exposure to higher-risk jurisdictions. Key business documents and source of funds evidence are missing. Recommend EDD and escalation for further review."
  },
  {
    name: "Sara Khan",
    difficulty: "Beginner",
    type: "Individual",
    activity: "Salaried software engineer",
    countryExposure: "Pakistan, UK",
    expectedTurnover: "PKR 600K/month salary and savings",
    actualActivity: "PKR 590K salary credits and routine card spending",
    pep: "No",
    adverseMedia: "None found",
    documents: "CNIC, employment letter, salary slips provided",
    sourceFunds: "Employment income verified",
    accountAge: "18 months",
    behaviour: "Consistent with profile",
    expectedRisk: "Low",
    expectedDecision: "Clear",
    redFlags: [],
    missingDocs: [],
    note: "Customer profile, income, and observed account activity are consistent. No material red flags identified. Standard CDD appears sufficient."
  },
  {
    name: "Blue River Welfare Foundation",
    difficulty: "Advanced",
    type: "Non-profit organisation",
    activity: "Charity and relief work",
    countryExposure: "Pakistan, Syria, Turkey",
    expectedTurnover: "PKR 3M/month donations",
    actualActivity: "PKR 9M/month, multiple small cash deposits followed by transfers overseas",
    pep: "One trustee is a former provincial adviser",
    adverseMedia: "None, but limited public footprint",
    documents: "Registration certificate provided; donor records incomplete",
    sourceFunds: "Donations; donor origin not sufficiently evidenced",
    accountAge: "7 months",
    behaviour: "Rapid movement of cash donations to foreign counterparties",
    expectedRisk: "High",
    expectedDecision: "Escalate",
    redFlags: ["NPO high-risk exposure", "PEP connection", "Rapid movement of funds", "Incomplete donor records"],
    missingDocs: ["Donor records", "Beneficiary details", "Purpose of overseas transfers"],
    note: "NPO activity involves conflict-zone exposure, incomplete donor records, and rapid onward transfers. PEP connection increases risk. Recommend EDD, purpose verification, and escalation."
  },
  {
    name: "Metro Cash & Carry Corner",
    difficulty: "Beginner",
    type: "Business",
    activity: "Small grocery store",
    countryExposure: "Pakistan only",
    expectedTurnover: "PKR 1.8M/month",
    actualActivity: "PKR 2M/month mostly cash deposits",
    pep: "No",
    adverseMedia: "None",
    documents: "CNIC, shop lease, tax registration provided",
    sourceFunds: "Retail sales consistent with cash-intensive business",
    accountAge: "3 years",
    behaviour: "Stable pattern with seasonal increase near Eid",
    expectedRisk: "Medium",
    expectedDecision: "Clear",
    redFlags: ["Cash-intensive business"],
    missingDocs: [],
    note: "Customer is cash-intensive, creating inherent AML risk, but activity is broadly consistent with declared business and historical behaviour. Maintain medium risk and routine monitoring."
  },
  {
    name: "Orion Consulting FZ-LLC",
    difficulty: "Advanced",
    type: "Business",
    activity: "Management consultancy",
    countryExposure: "UAE, British Virgin Islands, Pakistan",
    expectedTurnover: "PKR 4M/month",
    actualActivity: "PKR 21M/month from offshore counterparties",
    pep: "Beneficial owner structure unclear",
    adverseMedia: "Director linked to procurement controversy",
    documents: "Corporate profile provided; beneficial ownership chart missing",
    sourceFunds: "Consultancy fees; no contracts provided",
    accountAge: "2 months",
    behaviour: "Large round-number payments from multiple offshore entities",
    expectedRisk: "Critical",
    expectedDecision: "Escalate",
    redFlags: ["Complex ownership", "Offshore counterparties", "Adverse media", "Round-number transactions", "Missing beneficial ownership"],
    missingDocs: ["Beneficial ownership chart", "Service contracts", "Source of wealth evidence"],
    note: "New business account shows high-value offshore activity inconsistent with available documentation. Complex ownership and adverse media require urgent EDD and escalation."
  },
  {
    name: "Bilal Auto Parts",
    difficulty: "Intermediate",
    type: "Business",
    activity: "Auto parts retailer",
    countryExposure: "Pakistan, Japan",
    expectedTurnover: "PKR 5M/month",
    actualActivity: "PKR 6M/month, imports supported by invoices",
    pep: "No",
    adverseMedia: "None",
    documents: "Business registration, invoices, customs documents provided",
    sourceFunds: "Retail and wholesale auto parts revenue",
    accountAge: "5 years",
    behaviour: "Activity consistent with previous periods",
    expectedRisk: "Medium",
    expectedDecision: "Clear",
    redFlags: ["Cross-border activity"],
    missingDocs: [],
    note: "Cross-border import activity creates moderate inherent risk, but documentation supports the activity and behaviour is consistent with the customer profile. Maintain medium risk."
  }
];

const monitoringCases = [
  {
    title: "Multiple Cash Deposits Below Threshold",
    difficulty: "Beginner",
    profile: "Individual customer, declared monthly income PKR 180K, no business activity declared.",
    trigger: "Five cash deposits just below PKR 1M within six days.",
    expectedVsActual: "Expected salary credits only; actual cash activity exceeds profile.",
    typology: "Structuring",
    suspicious: "Yes",
    decision: "Escalate",
    pattern: "Repeated deposits slightly below a reporting threshold suggest possible structuring/smurfing.",
    rows: [
      ["01-Apr", "Cash Deposit", "PKR 960,000", "Self", "Branch"],
      ["02-Apr", "Cash Deposit", "PKR 975,000", "Self", "Branch"],
      ["03-Apr", "Cash Deposit", "PKR 940,000", "Self", "Branch"],
      ["05-Apr", "Cash Deposit", "PKR 990,000", "Self", "Branch"],
      ["06-Apr", "Online Transfer", "PKR 4,700,000", "New Counterparty", "Mobile"]
    ],
    note: "Customer conducted repeated cash deposits just below threshold levels followed by onward transfer to a new counterparty. Activity is inconsistent with declared income and should be escalated for review."
  },
  {
    title: "Dormant Account Reactivation",
    difficulty: "Intermediate",
    profile: "Dormant account with minimal activity for 14 months.",
    trigger: "Sudden high-value incoming wires and rapid outgoing transfers.",
    expectedVsActual: "Expected minimal activity; actual rapid movement of high-value funds.",
    typology: "Dormant account reactivation",
    suspicious: "Yes",
    decision: "Escalate",
    pattern: "Dormant accounts suddenly receiving and moving funds can indicate account takeover or mule use.",
    rows: [
      ["12-Mar", "Incoming Wire", "PKR 8,500,000", "Alpha Holdings", "Online"],
      ["13-Mar", "Outgoing Wire", "PKR 8,300,000", "Zeta Imports", "Online"],
      ["14-Mar", "Cash Withdrawal", "PKR 180,000", "Self", "ATM"]
    ],
    note: "Previously dormant account suddenly received high-value funds and transferred most of the value onward within 24 hours. Escalate and verify source, purpose, customer contact, and account control."
  },
  {
    title: "Trade Invoice Mismatch",
    difficulty: "Advanced",
    profile: "Importer of textile machinery with declared monthly turnover PKR 10M.",
    trigger: "Payments to overseas supplier far exceed invoice value and goods description is vague.",
    expectedVsActual: "Expected invoice-backed trade payments; actual payments appear overvalued.",
    typology: "TBML",
    suspicious: "Yes",
    decision: "Escalate",
    pattern: "Over/under-invoicing and vague goods descriptions may indicate trade-based money laundering.",
    rows: [
      ["09-Feb", "Trade Payment", "USD 95,000", "Eastern Machinery Ltd", "SWIFT"],
      ["10-Feb", "Invoice Value", "USD 42,000", "Machine parts", "Document"],
      ["12-Feb", "Trade Payment", "USD 88,000", "Eastern Machinery Ltd", "SWIFT"]
    ],
    note: "Trade payments materially exceed invoice values and supporting descriptions lack specificity. Possible TBML indicators require escalation and trade document review."
  },
  {
    title: "Low-Risk Salary Pattern",
    difficulty: "Beginner",
    profile: "Teacher receiving salary and paying routine bills.",
    trigger: "Automated rule flagged three transfers to same utility provider.",
    expectedVsActual: "Expected routine household payments; actual behaviour matches profile.",
    typology: "None",
    suspicious: "No",
    decision: "Close",
    pattern: "Activity is explainable and consistent with profile.",
    rows: [
      ["01-Apr", "Salary Credit", "PKR 220,000", "School", "Bank Transfer"],
      ["03-Apr", "Bill Payment", "PKR 18,400", "K-Electric", "App"],
      ["04-Apr", "Bill Payment", "PKR 9,200", "Internet Provider", "App"]
    ],
    note: "Alert can be closed as activity is consistent with customer profile and no suspicious pattern is identified."
  },
  {
    title: "Mule Account Indicators",
    difficulty: "Intermediate",
    profile: "Student account opened 3 weeks ago with expected low activity.",
    trigger: "Multiple incoming transfers from unrelated individuals followed by ATM withdrawals.",
    expectedVsActual: "Expected small student spending; actual pass-through activity.",
    typology: "Mule activity",
    suspicious: "Yes",
    decision: "Escalate",
    pattern: "Many-to-one incoming transfers followed by rapid cash-out is a common mule account indicator.",
    rows: [
      ["07-Apr", "Incoming Transfer", "PKR 85,000", "Person A", "Mobile"],
      ["07-Apr", "Incoming Transfer", "PKR 72,000", "Person B", "Mobile"],
      ["08-Apr", "ATM Withdrawal", "PKR 150,000", "Self", "ATM"],
      ["09-Apr", "Incoming Transfer", "PKR 98,000", "Person C", "Mobile"]
    ],
    note: "New student account shows pass-through activity inconsistent with stated profile. Multiple unrelated credits and rapid cash withdrawals indicate possible mule activity."
  },
  {
    title: "Sanctions Proximity Concern",
    difficulty: "Advanced",
    profile: "Freight forwarding business with regional trade exposure.",
    trigger: "Payment routed through counterparty with name similarity to sanctioned entity.",
    expectedVsActual: "Trade activity expected; sanctions match requires review.",
    typology: "Sanctions exposure",
    suspicious: "Need More Info",
    decision: "Escalate",
    pattern: "Potential sanctions name match should not be dismissed without screening and documentary review.",
    rows: [
      ["17-Mar", "Outgoing Wire", "USD 31,000", "Al Noor Shipping Co", "SWIFT"],
      ["17-Mar", "Screening", "Potential Match", "Al-Nour Shipping Group", "System"],
      ["18-Mar", "Document", "Bill of Lading", "Port of Loading unclear", "Upload"]
    ],
    note: "Potential sanctions proximity and unclear shipping documents require escalation for enhanced screening, counterparty verification, and trade document review."
  }
];

const riskFactors = [
  ["PEP", 35, "PEP exposure increases bribery, corruption and reputational risk."],
  ["High-risk jurisdiction", 25, "Jurisdictional exposure can increase ML/TF and sanctions risk."],
  ["Cash-intensive business", 15, "Cash activity can reduce transparency over source of funds."],
  ["Adverse media", 25, "Negative media may indicate fraud, corruption or financial crime concerns."],
  ["Complex ownership", 20, "Layered ownership can obscure beneficial control."],
  ["Missing source of funds", 25, "Unverified funds weaken the CDD basis."],
  ["Cross-border activity", 10, "International movement creates additional monitoring obligations."],
  ["New customer with high volume", 20, "High activity soon after onboarding may indicate misuse."],
  ["Sanctions proximity", 40, "Potential sanctions links require urgent review."],
  ["Dormant account reactivation", 20, "Dormant accounts suddenly becoming active can indicate mule or takeover risk."]
];

const redFlags = [
  ["Activity inconsistent with profile", "KYC/CDD", "Customer behaviour materially differs from declared occupation, income or business model.", "A salaried customer receives repeated high-value cash deposits.", "Review source of funds and consider escalation."],
  ["Unclear beneficial ownership", "Shell Companies", "Opaque ownership can hide the real controller or beneficiary.", "Company has several offshore shareholders and no clear controlling person.", "Request ownership chart and verify UBOs."],
  ["Frequent threshold-adjacent deposits", "Transaction Monitoring", "Repeated deposits below reporting levels can suggest structuring.", "PKR 980K deposited several times in a week.", "Review pattern and escalate if unsupported."],
  ["Potential sanctions name match", "Sanctions", "Even partial matches require careful screening and disposition.", "Counterparty name resembles a listed entity.", "Escalate for sanctions review."],
  ["Over/under-invoicing", "Trade-Based Money Laundering", "Trade values can be manipulated to move value disguised as commerce.", "Invoice says USD 40K but payment is USD 95K.", "Request trade documents and compare pricing."],
  ["PEP with unexplained wealth", "PEPs", "PEPs require scrutiny when funds exceed legitimate known sources.", "Former official opens account with large unexplained deposits.", "Conduct EDD and source of wealth review."],
  ["Rapid in-and-out movement", "Transaction Monitoring", "Pass-through funds may indicate layering or mule activity.", "Funds arrive and leave within hours.", "Check purpose, counterparties and customer rationale."],
  ["Dormant account suddenly active", "Digital/Online Banking", "Dormant accounts can be exploited after takeover or recruitment.", "Account inactive for a year receives PKR 8M.", "Verify customer control and source of funds."],
  ["Cash-intensive business with no records", "Cash Activity", "Cash businesses need credible sales records to support deposits.", "Retail shop deposits large cash but has no invoices or till records.", "Request records and update risk rating."],
  ["NPO conflict-zone transfers", "KYC/CDD", "NPOs can be abused for terrorist financing where controls are weak.", "Charity sends funds to conflict-zone counterparties.", "Verify beneficiaries, purpose and donor records."]
];

const sqlChallenges = [
  {
    title: "Find multiple cash deposits below threshold",
    task: "Identify customers with at least three cash deposits between PKR 900,000 and PKR 999,999 in a 30-day period.",
    hint: "Filter by transaction type and amount range, then GROUP BY customer_id.",
    solution: `SELECT customer_id, COUNT(*) AS deposit_count, SUM(amount) AS total_amount
FROM transactions
WHERE type = 'Cash Deposit'
  AND amount BETWEEN 900000 AND 999999
  AND date >= '2026-04-01'
GROUP BY customer_id
HAVING COUNT(*) >= 3;`,
    explanation: "This looks for repeated deposits just below a threshold, a possible structuring indicator."
  },
  {
    title: "Dormant accounts suddenly active",
    task: "Find customers whose account is older than one year and who made transactions above PKR 5M this month.",
    hint: "Join customers and transactions, filter account_open_date and high transaction amount.",
    solution: `SELECT c.customer_id, c.name, t.amount, t.date
FROM customers c
JOIN transactions t ON c.customer_id = t.customer_id
WHERE c.account_open_date < '2025-04-01'
  AND t.date >= '2026-04-01'
  AND t.amount > 5000000;`,
    explanation: "High-value activity on older/dormant accounts may deserve review if inconsistent with history."
  },
  {
    title: "Transfers to high-risk countries",
    task: "List transactions sent to countries marked as high-risk.",
    hint: "Use IN to filter counterparty countries.",
    solution: `SELECT transaction_id, customer_id, amount, counterparty_country
FROM transactions
WHERE counterparty_country IN ('Country A', 'Country B', 'Country C');`,
    explanation: "Jurisdictional risk is a common factor in transaction monitoring and EDD."
  },
  {
    title: "Activity inconsistent with expected turnover",
    task: "Find customers whose monthly transaction total is more than 3x expected monthly turnover.",
    hint: "Join, group and compare SUM(amount) with expected_monthly_turnover.",
    solution: `SELECT c.customer_id, c.name, c.expected_monthly_turnover,
       SUM(t.amount) AS actual_monthly_activity
FROM customers c
JOIN transactions t ON c.customer_id = t.customer_id
WHERE t.date >= '2026-04-01'
GROUP BY c.customer_id, c.name, c.expected_monthly_turnover
HAVING SUM(t.amount) > c.expected_monthly_turnover * 3;`,
    explanation: "Large deviations from expected activity are a classic profile inconsistency indicator."
  },
  {
    title: "Duplicate phone or address",
    task: "Find phone numbers used by more than one customer.",
    hint: "Group by phone and use HAVING COUNT greater than one.",
    solution: `SELECT phone, COUNT(*) AS customer_count
FROM customers
GROUP BY phone
HAVING COUNT(*) > 1;`,
    explanation: "Shared contact details can indicate linked accounts, mule networks or onboarding quality issues."
  },
  {
    title: "Round-number transactions",
    task: "Find high-value round-number transactions above PKR 1M.",
    hint: "Use modulo logic to find values divisible by 100,000.",
    solution: `SELECT transaction_id, customer_id, amount, date
FROM transactions
WHERE amount > 1000000
  AND amount % 100000 = 0;`,
    explanation: "Round numbers are not suspicious alone, but repeated round high-value transfers may support a wider pattern."
  },
  {
    title: "High-value transactions by new customers",
    task: "Find customers opened within the last 60 days with transactions above PKR 3M.",
    hint: "Join customers and transactions, then filter recent account_open_date.",
    solution: `SELECT c.customer_id, c.name, c.account_open_date, t.amount
FROM customers c
JOIN transactions t ON c.customer_id = t.customer_id
WHERE c.account_open_date >= '2026-02-01'
  AND t.amount > 3000000;`,
    explanation: "New accounts with high-value flows may require onboarding review and source of funds checks."
  },
  {
    title: "Rapid movement of funds",
    task: "Identify customers with incoming and outgoing transactions on the same day over PKR 1M.",
    hint: "Self-join transactions by customer and date, comparing incoming and outgoing types.",
    solution: `SELECT i.customer_id, i.date, i.amount AS incoming_amount, o.amount AS outgoing_amount
FROM transactions i
JOIN transactions o
  ON i.customer_id = o.customer_id
 AND i.date = o.date
WHERE i.type = 'Incoming Wire'
  AND o.type = 'Outgoing Wire'
  AND i.amount > 1000000
  AND o.amount > 1000000;`,
    explanation: "Same-day in-and-out movement can indicate layering or pass-through account behaviour."
  }
];

const sarScenarios = [
  {
    title: "Structuring Alert",
    scenario: "A salaried customer deposits PKR 950K–990K five times within one week and transfers the combined amount to a new beneficiary.",
    model: "Summary of activity: Customer made repeated cash deposits just below PKR 1M within a short period, followed by onward transfer to a new beneficiary.\n\nWhy unusual: Activity is inconsistent with declared salaried income and appears designed to avoid threshold attention.\n\nRed flags: Structuring, inconsistent activity, rapid movement of funds, new counterparty.\n\nFurther information required: Source of cash, purpose of transfer, relationship with beneficiary, updated occupation/income evidence.\n\nRecommended action: Escalate for further AML review and consider EDD."
  },
  {
    title: "NPO Overseas Transfers",
    scenario: "A charity receives numerous cash donations and sends funds to overseas beneficiaries in a conflict-affected region. Donor records are incomplete.",
    model: "Summary of activity: NPO receives cash donations and conducts overseas transfers to higher-risk areas while donor records remain incomplete.\n\nWhy unusual: NPOs with weak donor transparency and conflict-zone exposure present heightened ML/TF risk.\n\nRed flags: Incomplete donor records, high-risk geography, cash donations, unclear beneficiary purpose.\n\nFurther information required: Donor list, beneficiary verification, project documents, purpose of transfers.\n\nRecommended action: Escalate for EDD and senior compliance review."
  },
  {
    title: "Potential Mule Account",
    scenario: "A student account opened recently receives funds from several unrelated individuals and cashes out through ATMs within 24 hours.",
    model: "Summary of activity: Recently opened student account received multiple unrelated credits and withdrew funds rapidly through ATMs.\n\nWhy unusual: Pattern is inconsistent with expected student activity and indicates possible pass-through or mule account use.\n\nRed flags: New account, multiple unrelated senders, rapid cash-out, profile inconsistency.\n\nFurther information required: Relationship with senders, purpose of funds, proof of entitlement, customer interview if required.\n\nRecommended action: Escalate for investigation and consider restrictions under internal policy."
  },
  {
    title: "Trade-Based Concern",
    scenario: "A trading company sends payments far above invoice value to an overseas supplier. Goods descriptions are vague and shipping documents are incomplete.",
    model: "Summary of activity: Customer sent trade payments exceeding invoice values to an overseas supplier while documents contain vague goods descriptions.\n\nWhy unusual: Payment and invoice mismatch may indicate trade-based money laundering through over-invoicing.\n\nRed flags: Invoice mismatch, vague goods description, incomplete shipping documents, overseas counterparty risk.\n\nFurther information required: Full invoice set, bill of lading, customs documentation, contract, price benchmarking.\n\nRecommended action: Escalate for TBML review and request supporting trade documentation."
  }
];

function loadProgress() {
  const saved = localStorage.getItem("fincrimeProgress");
  return saved ? { ...progressDefaults, ...JSON.parse(saved) } : { ...progressDefaults };
}
function saveProgress() { localStorage.setItem("fincrimeProgress", JSON.stringify(progress)); updateDashboard(); }
function addBadge(name) { if (!progress.badges.includes(name)) progress.badges.push(name); }
function recordScore(score, highRisk) {
  progress.casesCompleted += 1;
  progress.totalScore += score;
  progress.attempts += 1;
  if (highRisk) progress.highRiskFound += 1;
  if (progress.casesCompleted >= 1) addBadge("First Case Completed");
  if (progress.highRiskFound >= 2) addBadge("Risk Analyst");
  if (progress.casesCompleted >= 4) addBadge("Red Flag Spotter");
  saveProgress();
}

function initNavigation() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => link.addEventListener("click", e => {
    e.preventDefault();
    showSection(link.dataset.section);
  }));
  document.querySelectorAll("[data-jump]").forEach(btn => btn.addEventListener("click", () => showSection(btn.dataset.jump)));
  document.getElementById("mobileMenu").addEventListener("click", () => document.getElementById("navMenu").classList.toggle("open"));
  document.getElementById("resetProgress").addEventListener("click", () => {
    if (confirm("Reset all local progress?")) {
      progress = { ...progressDefaults };
      saveProgress();
      renderRiskFactors();
    }
  });
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active-section"));
  document.getElementById(id).classList.add("active-section");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.toggle("active", l.dataset.section === id));
  document.getElementById("navMenu").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateDashboard() {
  document.getElementById("casesCompleted").textContent = progress.casesCompleted;
  const avg = progress.attempts ? Math.round(progress.totalScore / progress.attempts) : 0;
  document.getElementById("averageScore").textContent = `${avg}%`;
  document.getElementById("highRiskFound").textContent = progress.highRiskFound;
  document.getElementById("sqlAttempted").textContent = progress.sqlAttempted;
  const possible = ["First Case Completed", "Risk Analyst", "Red Flag Spotter", "SQL Beginner", "Escalation Ready"];
  document.getElementById("badges").innerHTML = possible.map(b => `<span class="badge ${progress.badges.includes(b) ? "" : "locked"}">${b}</span>`).join("");
}

function renderKycCase() {
  const c = kycCases[currentKyc];
  const options = [...new Set([...c.redFlags, "Cash-intensive business", "Complex ownership", "Rapid movement of funds", "Cross-border activity", "Adverse media", "Missing beneficial ownership"] )];
  const docOptions = [...new Set([...c.missingDocs, "CNIC", "Proof of address", "Tax certificate", "Employment letter", "Board resolution"] )];
  document.getElementById("kycCase").innerHTML = `
    <article class="case-card">
      <div class="case-header"><div><span class="eyebrow">Case ${currentKyc + 1} of ${kycCases.length}</span><h2>${c.name}</h2></div><span class="pill ${c.difficulty.toLowerCase()}">${c.difficulty}</span></div>
      <div class="case-meta"><span class="pill">${c.type}</span><span class="pill">${c.activity}</span><span class="pill">${c.countryExposure}</span></div>
      <div class="detail-grid">
        ${detail("Expected turnover", c.expectedTurnover)}${detail("Actual activity", c.actualActivity)}${detail("PEP status", c.pep)}${detail("Adverse media", c.adverseMedia)}${detail("Documents", c.documents)}${detail("Source of funds/wealth", c.sourceFunds)}${detail("Account age", c.accountAge)}${detail("Unusual behaviour", c.behaviour)}
      </div>
      <div class="form-grid">
        ${radioBox("Risk rating", "kycRisk", ["Low", "Medium", "High", "Critical"])}
        ${radioBox("Decision", "kycDecision", ["Clear", "Request Info", "Escalate"])}
        ${checkBox("Main red flags", "kycRed", options)}
        ${checkBox("Missing documents", "kycDocs", docOptions)}
      </div>
      <div class="actions"><button class="primary-btn" onclick="submitKyc()">Submit Review</button><button class="secondary-btn" onclick="nextKyc()">Next Case</button></div>
      <div id="kycResult" class="result-box"></div>
    </article>`;
}
function detail(label, value) { return `<div class="detail"><span>${label}</span>${value}</div>`; }
function radioBox(title, name, opts) { return `<div class="form-box"><h4>${title}</h4><div class="radio-row">${opts.map(o => `<label class="choice"><input type="radio" name="${name}" value="${o}"> ${o}</label>`).join("")}</div></div>`; }
function checkBox(title, name, opts) { return `<div class="form-box"><h4>${title}</h4><div class="checkbox-list">${opts.map(o => `<label class="choice"><input type="checkbox" name="${name}" value="${o}"> ${o}</label>`).join("")}</div></div>`; }
function checkedValues(name) { return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value); }
function selectedValue(name) { return document.querySelector(`input[name="${name}"]:checked`)?.value || ""; }

function submitKyc() {
  const c = kycCases[currentKyc];
  const risk = selectedValue("kycRisk");
  const decision = selectedValue("kycDecision");
  const reds = checkedValues("kycRed");
  const docs = checkedValues("kycDocs");
  let score = 0;
  if (risk === c.expectedRisk) score += 35;
  if (decision === c.expectedDecision) score += 25;
  const redHits = c.redFlags.filter(r => reds.includes(r)).length;
  score += c.redFlags.length ? Math.round((redHits / c.redFlags.length) * 25) : 25;
  const docHits = c.missingDocs.filter(d => docs.includes(d)).length;
  score += c.missingDocs.length ? Math.round((docHits / c.missingDocs.length) * 15) : 15;
  score = Math.min(score, 100);
  const missed = c.redFlags.filter(r => !reds.includes(r));
  recordScore(score, ["High", "Critical"].includes(c.expectedRisk));
  document.getElementById("kycResult").classList.add("show");
  document.getElementById("kycResult").innerHTML = `<h3>Your Score: ${score}%</h3><p><b>Expected risk:</b> ${c.expectedRisk}. <b>Expected decision:</b> ${c.expectedDecision}.</p><p><b>Red flags missed:</b> ${missed.length ? missed.join(", ") : "None"}</p><p class="analyst-note"><b>Suggested analyst note:</b> ${c.note}</p>`;
}
function nextKyc() { currentKyc = (currentKyc + 1) % kycCases.length; renderKycCase(); }

function renderMonitoringCase() {
  const c = monitoringCases[currentMonitoring];
  document.getElementById("monitoringCase").innerHTML = `
    <article class="case-card">
      <div class="case-header"><div><span class="eyebrow">Alert ${currentMonitoring + 1} of ${monitoringCases.length}</span><h2>${c.title}</h2></div><span class="pill ${c.difficulty.toLowerCase()}">${c.difficulty}</span></div>
      <div class="detail-grid">${detail("Customer profile", c.profile)}${detail("Alert trigger", c.trigger)}${detail("Expected vs actual", c.expectedVsActual)}${detail("Pattern", c.pattern)}</div>
      <table class="transaction-table"><thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Counterparty</th><th>Channel</th></tr></thead><tbody>${c.rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <div class="form-grid">
        ${radioBox("Is it suspicious?", "monSuspicious", ["Yes", "No", "Need More Info"])}
        ${radioBox("Decision", "monDecision", ["Escalate", "Close", "Request Info"])}
        ${radioBox("Typology", "monTypology", ["Structuring", "Mule activity", "TBML", "Sanctions exposure", "Rapid movement of funds", "Dormant account reactivation", "Unusual cash activity", "PEP-related risk", "None"])}
        <div class="form-box"><h4>Short rationale</h4><textarea id="monRationale" placeholder="Write your reasoning here..."></textarea></div>
      </div>
      <div class="actions"><button class="primary-btn" onclick="submitMonitoring()">Submit Alert Decision</button><button class="secondary-btn" onclick="nextMonitoring()">Next Alert</button></div>
      <div id="monitoringResult" class="result-box"></div>
    </article>`;
}
function submitMonitoring() {
  const c = monitoringCases[currentMonitoring];
  const suspicious = selectedValue("monSuspicious");
  const decision = selectedValue("monDecision");
  const typology = selectedValue("monTypology");
  let score = 0;
  if (suspicious === c.suspicious) score += 35;
  if (decision === c.decision || (c.decision === "Escalate" && decision === "Request Info")) score += 30;
  if (typology === c.typology || (c.typology === "Dormant account reactivation" && typology === "Rapid movement of funds")) score += 25;
  if (document.getElementById("monRationale").value.trim().length > 30) score += 10;
  recordScore(score, c.decision === "Escalate");
  document.getElementById("monitoringResult").classList.add("show");
  document.getElementById("monitoringResult").innerHTML = `<h3>Your Score: ${score}%</h3><p><b>Model answer:</b> Suspicious: ${c.suspicious}; Typology: ${c.typology}; Decision: ${c.decision}.</p><p>${c.pattern}</p><p class="analyst-note"><b>Suggested escalation note:</b> ${c.note}</p>`;
}
function nextMonitoring() { currentMonitoring = (currentMonitoring + 1) % monitoringCases.length; renderMonitoringCase(); }

function renderRiskFactors() {
  document.getElementById("riskFactors").innerHTML = riskFactors.map(([name, points, desc], i) => `<label class="choice"><input type="checkbox" data-points="${points}" data-desc="${desc}" onchange="calculateRisk()"> <span><b>${name}</b> (+${points})<br><small>${desc}</small></span></label>`).join("");
  calculateRisk();
}
function calculateRisk() {
  const selected = [...document.querySelectorAll("#riskFactors input:checked")];
  const score = selected.reduce((sum, i) => sum + Number(i.dataset.points), 0);
  let level = "Low", action = "Standard CDD.", cls = "low";
  if (score >= 100) { level = "Critical"; action = "Immediate escalation, EDD and senior compliance review."; cls = "critical"; }
  else if (score >= 70) { level = "High"; action = "EDD required; verify source of funds/wealth and consider escalation."; cls = "high"; }
  else if (score >= 35) { level = "Medium"; action = "Enhanced monitoring and targeted CDD refresh may be appropriate."; cls = "medium"; }
  document.getElementById("riskScore").textContent = score;
  const riskLevel = document.getElementById("riskLevel");
  riskLevel.textContent = level;
  riskLevel.className = `risk-level pill ${cls}`;
  document.getElementById("riskExplanation").textContent = selected.length ? `Selected factors: ${selected.map(i => i.parentElement.innerText.split("(+")[0].trim()).join(", ")}.` : "Select factors to build a risk profile.";
  document.getElementById("riskAction").textContent = `Suggested action: ${action}`;
}

function renderRedFlags() {
  const categories = ["all", ...new Set(redFlags.map(r => r[1]))];
  document.getElementById("redFlagCategory").innerHTML = categories.map(c => `<option value="${c}">${c === "all" ? "All categories" : c}</option>`).join("");
  document.getElementById("redFlagSearch").addEventListener("input", filterRedFlags);
  document.getElementById("redFlagCategory").addEventListener("change", filterRedFlags);
  filterRedFlags();
}
function filterRedFlags() {
  const q = document.getElementById("redFlagSearch").value.toLowerCase();
  const cat = document.getElementById("redFlagCategory").value;
  const filtered = redFlags.filter(r => (cat === "all" || r[1] === cat) && r.join(" ").toLowerCase().includes(q));
  document.getElementById("redFlagList").innerHTML = filtered.map(r => `<article class="library-card"><small>${r[1]}</small><h3>${r[0]}</h3><p><b>Why it matters:</b> ${r[2]}</p><p><b>Example:</b> ${r[3]}</p><p class="analyst-note"><b>Analyst action:</b> ${r[4]}</p></article>`).join("");
}

function renderSqlChallenges() {
  document.getElementById("sqlChallenges").innerHTML = sqlChallenges.map((c, i) => `<div class="accordion-item"><div class="accordion-head"><div><span class="pill">Challenge ${i + 1}</span><h3>${c.title}</h3><p>${c.task}</p></div><button class="secondary-btn" onclick="toggleSql(${i})">Open</button></div><div class="accordion-body" id="sql-${i}"><p><b>Hint:</b> ${c.hint}</p><pre><code>${escapeHtml(c.solution)}</code></pre><p>${c.explanation}</p></div></div>`).join("");
}
function toggleSql(i) {
  document.getElementById(`sql-${i}`).parentElement.classList.toggle("open");
  progress.sqlAttempted += 1;
  addBadge("SQL Beginner");
  saveProgress();
}
function escapeHtml(str) { return str.replace(/[&<>"]/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s])); }

function renderSarPractice() {
  document.getElementById("sarPractice").innerHTML = sarScenarios.map((s, i) => `<article class="sar-card"><span class="pill">Scenario ${i + 1}</span><h3>${s.title}</h3><p>${s.scenario}</p><textarea placeholder="Write your internal escalation note here..."></textarea><div class="actions"><button class="primary-btn" onclick="showModelNote(${i})">Show Model Note</button></div><pre class="model-note" id="model-${i}">${s.model}</pre></article>`).join("");
}
function showModelNote(i) {
  document.getElementById(`model-${i}`).classList.add("show");
  addBadge("Escalation Ready");
  saveProgress();
}

window.submitKyc = submitKyc;
window.nextKyc = nextKyc;
window.submitMonitoring = submitMonitoring;
window.nextMonitoring = nextMonitoring;
window.calculateRisk = calculateRisk;
window.toggleSql = toggleSql;
window.showModelNote = showModelNote;

initNavigation();
updateDashboard();
renderKycCase();
renderMonitoringCase();
renderRiskFactors();
renderRedFlags();
renderSqlChallenges();
renderSarPractice();
