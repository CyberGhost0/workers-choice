import Redis from 'ioredis';

let redis: Redis | null = null;

function createRedis(): Redis | null {
  try {
    const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null;
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
      enableReadyCheck: false,
    });

    client.on('error', () => {});

    return client;
  } catch {
    return null;
  }
}

export async function connectRedis() {
  redis = createRedis();
  if (!redis) throw new Error('Redis unavailable');
  try {
    await redis.connect();
    await redis.ping();
    console.log('Redis connection verified');
  } catch (error) {
    redis = null;
    throw error;
  }
}

export function getRedis(): Redis | null {
  return redis;
}

export { redis };
