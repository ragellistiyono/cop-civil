import { Client, Account, Functions, Databases, Storage, ID } from 'appwrite';

const client = new Client();

if (import.meta.env.VITE_APPWRITE_ENDPOINT && import.meta.env.VITE_APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
} else if (import.meta.env.DEV) {
  console.warn(
    '[Appwrite] Missing VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID. ' +
    'Copy .env.example to .env and fill in your project values.'
  );
}

const account = new Account(client);

const functions = new Functions(client);

const databases = new Databases(client);

const storage = new Storage(client);

export { client, account, functions, databases, storage, ID };
