import type LRUCache from "lru-cache";
import Client from 'lru-cache';

declare global {
  var cache: LRUCache<string, string> | undefined;
}

export default function getCache(): LRUCache<string, string> {
  let client = global['cache'];
  if(!client) {
    client = global['cache'] = new Client({
      max: 50,
      maxAge: 1000 * 60 * 60
    });
  }
  return client;
}

