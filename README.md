Identity Reconciliation API

Backend Engineering Assignment – BiteSpeed

This service reconciles customer identities across multiple purchases using email and phone number matching.

It ensures:

One primary contact per customer

Multiple secondary contacts linked correctly

Oldest contact always remains primary

Automatic merging of contact trees

No duplicate contact creation

🌍 Live API

Base URL:

https://identity-reconciliation-6tf1.onrender.com

📌 Endpoint
POST /identify

Accepts JSON body:

{
  "email"?: string,
  "phoneNumber"?: string
}

At least one field is required.

✅ Example Request
curl -X POST https://identity-reconciliation-6tf1.onrender.com/identify \
-H "Content-Type: application/json" \
-d '{"email":"doc@future.com","phoneNumber":"111111"}'
✅ Example Response
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["doc@future.com"],
    "phoneNumbers": ["111111"],
    "secondaryContactIds": []
  }
}
🧠 How It Works

Searches existing contacts by email or phone number.

Resolves to the ultimate primary contact.

Merges multiple primary trees if needed.

Reassigns all linked contacts to the oldest primary.

Creates a secondary contact if new information is provided.

Returns consolidated contact details.

All operations run inside a Prisma transaction to ensure data consistency.

🏗 Tech Stack

Node.js

TypeScript

Express

Prisma ORM

PostgreSQL

Render (Deployment)

🚀 Run Locally

Clone repository:

git clone https://github.com/divynshu670/identity-reconciliation.git
cd identity-reconciliation

Install dependencies:

npm install

Create .env file:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/identity_db"
PORT=3000

Run migrations:

npx prisma migrate dev

Start server:

npm run dev
📂 Project Structure
src/
  controllers/
  services/
  repositories/
  routes/
  config/
  utils/
prisma/
  migrations/
🔒 Notes

.env file is not committed

Uses environment variables for database configuration

Production deployment uses prisma migrate deploy

Handles primary merge and subtree reassignment safely

Author: Divyanshu Kumar

