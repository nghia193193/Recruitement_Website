import { createClient } from 'redis';

export const client = createClient({
    url: process.env.REDIS_URI
})

client.connect();
client.on('error', err => console.log('Redis Client Error', err))

export default client;