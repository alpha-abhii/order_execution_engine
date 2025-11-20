import dotenv from 'dotenv';
dotenv.config();

import { buildServer } from './api/server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function main() {
    try {
        const server = await buildServer();
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

main();