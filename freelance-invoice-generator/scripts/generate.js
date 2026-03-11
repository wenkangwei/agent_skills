#!/usr/bin/env node

/**
 * Freelance Invoice Generator
 * Interactive invoice creation with automated calculations
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Data paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json');
const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or create config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {
    currency: 'USD',
    taxRate: 0,
    invoicePrefix: 'INV',
    defaultTemplate: 'modern'
  };
}

// Load clients
function loadClients() {
  if (!fs.existsSync(CLIENTS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
}

// Load projects
function loadProjects() {
  if (!fs.existsSync(PROJECTS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
}

// Load invoices
function loadInvoices() {
  if (!fs.existsSync(INVOICES_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf8'));
}

// Generate invoice number
function generateInvoiceNumber(config, invoices) {
  const prefix = config.invoicePrefix || 'INV';
  const numbers = invoices
    .filter(inv => inv.number.startsWith(prefix))
    .map(inv => parseInt(inv.number.replace(prefix, '')))
    .filter(num => !isNaN(num));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// Calculate totals
function calculateTotals(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt function
function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

// Generate invoice
async function generateInvoice() {
  try {
    console.log('📝 Freelance Invoice Generator');
    console.log('═════════════════════════════════\n');

    const config = loadConfig();
    const clients = loadClients();
    const projects = loadProjects();
    const invoices = loadInvoices();

    // Select client
    if (clients.length === 0) {
      console.log('❌ No clients found. Please add a client first.');
      console.log('   Run: node scripts/clients/add.js');
      process.exit(1);
    }

    console.log('Select client:');
    clients.forEach((client, index) => {
      console.log(`  ${index + 1}. ${client.name} (${client.company || 'Individual'})`);
    });

    const clientIndex = parseInt(await prompt('Enter client number: ')) - 1;
    if (clientIndex < 0 || clientIndex >= clients.length) {
      console.log('❌ Invalid client selection');
      process.exit(1);
    }

    const client = clients[clientIndex];
    console.log(`✅ Selected: ${client.name}\n`);

    // Select project (optional)
    const clientProjects = projects.filter(p => p.clientId === client.id);
    let selectedProject = null;

    if (clientProjects.length > 0) {
      console.log('Select project (optional, press Enter to skip):');
      clientProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.name} (${project.status})`);
      });

      const projectInput = await prompt('Enter project number or press Enter: ');
      if (projectInput) {
        const projectIndex = parseInt(projectInput) - 1;
        if (projectIndex >= 0 && projectIndex < clientProjects.length) {
          selectedProject = clientProjects[projectIndex];
          console.log(`✅ Selected project: ${selectedProject.name}\n`);
        }
      }
    }

    // Add line items
    console.log('Add line items (type "done" when finished):');
    const items = [];
    let itemCounter = 0;

    while (true) {
      itemCounter++;
      const description = await prompt(`  ${itemCounter}. Item description: `);
      if (description.toLowerCase() === 'done' || !description) {
        if (items.length === 0) {
          console.log('❌ At least one item is required');
          itemCounter--;
          continue;
        }
        break;
      }

      const quantity = parseFloat(await prompt(`  Quantity: `)) || 1;
      const price = parseFloat(await prompt(`  Unit price (${config.currency}): `));

      if (isNaN(price) || price < 0) {
        console.log('❌ Invalid price');
        itemCounter--;
        continue;
      }

      items.push({ description, quantity, price });
    }

    // Tax rate
    console.log(`\nTax rate (default: ${config.taxRate}%):`);
    const taxInput = await prompt('Enter tax rate or press Enter: ');
    const taxRate = taxInput ? parseFloat(taxInput) : config.taxRate;

    // Calculate totals
    const { subtotal, tax, total } = calculateTotals(items, taxRate);

    // Invoice date and due date
    const invoiceDate = new Date();
    const dueDaysInput = await prompt('\nPayment terms (days, default 30): ');
    const dueDays = dueDaysInput ? parseInt(dueDaysInput) : 30;
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + dueDays);

    // Notes (optional)
    const notes = await prompt('Notes (optional): ');

    // Generate invoice
    const invoice = {
      id: Date.now().toString(),
      number: generateInvoiceNumber(config, invoices),
      clientId: client.id,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      projectId: selectedProject ? selectedProject.id : null,
      projectName: selectedProject ? selectedProject.name : null,
      items,
      subtotal,
      taxRate,
      tax,
      total,
      currency: config.currency,
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save invoice
    invoices.push(invoice);
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2));

    // Display invoice summary
    console.log('\n📄 Invoice Summary');
    console.log('═════════════════════════════════');
    console.log(`Invoice Number: ${invoice.number}`);
    console.log(`Client: ${client.name} ${client.company ? `(${client.company})` : ''}`);
    console.log(`Date: ${invoiceDate.toLocaleDateString()}`);
    console.log(`Due: ${dueDate.toLocaleDateString()}\n`);

    console.log('Items:');
    items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      console.log(`  ${item.description}`);
      console.log(`    ${item.quantity} × ${config.currency}${item.price.toFixed(2)} = ${config.currency}${itemTotal.toFixed(2)}`);
    });

    console.log(`\nSubtotal: ${config.currency}${subtotal.toFixed(2)}`);
    console.log(`Tax (${taxRate}%): ${config.currency}${tax.toFixed(2)}`);
    console.log(`Total: ${config.currency}${total.toFixed(2)}`);

    if (notes) {
      console.log(`\nNotes: ${notes}`);
    }

    console.log('\n✅ Invoice generated successfully!');
    console.log(`📁 Saved to: ${INVOICES_FILE}`);

    // Ask about PDF export
    const exportPdf = await prompt('\nExport to PDF? (y/n): ');
    if (exportPdf.toLowerCase() === 'y') {
      console.log('📊 PDF export feature coming soon...');
    }

    rl.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  generateInvoice();
}

module.exports = { generateInvoice };
