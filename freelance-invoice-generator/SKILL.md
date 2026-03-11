---
name: freelance-invoice-generator
description: Freelance invoice generator with professional templates and automated calculations
metadata:
  {
    "openclaw":
      {
        "requires": { "bins": ["node"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "node",
              "bins": ["node"],
              "label": "Install Node.js Runtime"
            }
          ]
      },
    "skill":
      {
        "name": "Freelance Invoice Generator",
        "version": "1.0.0",
        "category": "finance",
        "author": "doge",
        "tags": ["freelance", "invoice", "billing", "money", "finance", "automation"]
      }
  }
---

# Freelance Invoice Generator

Professional invoice generator for freelancers with automated calculations and customizable templates.

## Features

- ✅ Multiple invoice templates (Modern, Minimal, Professional)
- ✅ Automated calculations (subtotal, tax, discount, total)
- ✅ Client and project management
- ✅ PDF export capability
- ✅ Multi-currency support
- ✅ Invoice history tracking
- ✅ Payment status management

## Installation

### Quick Install

```bash
cd ~/.openclaw/workspace/skills
git clone https://github.com/openclaw/freelance-invoice-generator
cd freelance-invoice-generator
npm install
```

### Dependencies

- Node.js (v16+)
- npm packages: `pdfkit`, `moment`

## Usage

### Generate Invoice

```bash
# Interactive invoice creation
node scripts/generate.js

# Create invoice from template
node scripts/create.js --template modern

# List all invoices
node scripts/list.js

# Export to PDF
node scripts/export.js --invoice-id INV001
```

### Interactive Commands

```bash
# Add new client
node scripts/clients/add.js

# View client details
node scripts/clients/view.js <client-id>

# Add project
node scripts/projects/add.js --client-id <client-id>

# Generate invoice for project
node scripts/generate.js --project-id <project-id>
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|-----------|-------------|----------|-----------|
| INVOICE_CURRENCY | Default currency | USD | false |
| INVOICE_TAX_RATE | Default tax rate (%) | 0 | false |
| INVOICE_NUMBER_PREFIX | Invoice number prefix | INV | false |
| PDF_OUTPUT_DIR | PDF output directory | ./exports | false |

### Config Files

- `config.json` - Main configuration
- `data/clients.json` - Client database
- `data/projects.json` - Project database
- `data/invoices.json` - Invoice history

## Invoice Templates

### Modern Template

Clean, contemporary design with bold headers and color accents.

### Minimal Template

Simple, streamlined design focusing on clarity and professionalism.

### Professional Template

Traditional business invoice layout with all standard fields.

## Examples

### Quick Invoice Generation

```bash
# Generate invoice with default settings
node scripts/generate.js

# Follow prompts:
# 1. Select client: "John Doe Corp"
# 2. Select project: "Website Development"
# 3. Add line items: "Frontend Development - $1000"
# 4. Set tax rate: "10%"
# 5. Export to PDF: "yes"
```

### Batch Invoice Generation

```bash
# Generate all pending invoices
node scripts/batch-generate.js

# Filter by client
node scripts/batch-generate.js --client-id CLT001

# Filter by date range
node scripts/batch-generate.js --from 2026-03-01 --to 2026-03-31
```

## Troubleshooting

### Common Issues

1. **Issue**: PDF export fails
   - **Solution**: Ensure `pdfkit` is installed: `npm install pdfkit`

2. **Issue**: Client not found
   - **Solution**: Add client first: `node scripts/clients/add.js`

3. **Issue**: Invoice number already exists
   - **Solution**: Check existing invoices: `node scripts/list.js`

## Money-Making Potential

This skill helps freelancers:
- Save time on manual invoice creation
- Reduce calculation errors
- Maintain professional branding
- Track payments and follow up
- Scale client management

**Estimated time saved**: 2-4 hours per week
**Professional impact**: Improved client trust and faster payments

## License

MIT License

---

**Created**: 2026-03-11
**Author**: doge 🐕
**Usage**: Run `node scripts/generate.js` to start creating invoices
