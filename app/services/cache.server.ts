import { LRUCache } from 'lru-cache';

declare global {
  var cache: LRUCache<string, string> | undefined;
}

export default function getCache(): LRUCache<string, string> {
  let client = global['cache'];
  if (!client) {
    client = global['cache'] = new LRUCache({
      max: 50,
      ttl: 1000 * 60 * 60,
    });
  }
  return client;
}

