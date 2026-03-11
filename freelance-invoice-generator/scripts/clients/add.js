#!/usr/bin/env node

/**
 * Add new client
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadClients() {
  if (!fs.existsSync(CLIENTS_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
}

function saveClients(clients) {
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2));
}

function generateClientId(clients) {
  const maxId = clients.reduce((max, client) => {
    const num = parseInt(client.id.replace('CLT', ''));
    return num > max ? num : max;
  }, 0);
  return `CLT${String(maxId + 1).padStart(3, '0')}`;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

async function addClient() {
  try {
    console.log('👤 Add New Client');
    console.log('═════════════════════════════════\n');

    const name = await prompt('Client name: ');
    if (!name) {
      console.log('❌ Client name is required');
      process.exit(1);
    }

    const email = await prompt('Email: ');
    const company = await prompt('Company (optional): ');
    const phone = await prompt('Phone (optional): ');
    const address = await prompt('Address (optional): ');

    const clients = loadClients();
    const client = {
      id: generateClientId(clients),
      name,
      email,
      company,
      phone,
      address,
      createdAt: new Date().toISOString()
    };

    clients.push(client);
    saveClients(clients);

    console.log('\n✅ Client added successfully!');
    console.log(`📋 Client ID: ${client.id}`);
    console.log(`👤 Name: ${client.name}`);
    console.log(`📧 Email: ${client.email}`);
    if (company) console.log(`🏢 Company: ${company}`);
    console.log(`📁 Saved to: ${CLIENTS_FILE}`);

    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  addClient();
}
