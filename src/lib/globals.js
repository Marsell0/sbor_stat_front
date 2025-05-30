export let server_http = "http://localhost:8000"

export function getIP() {
    return server_http
  }

import { writable } from 'svelte/store';
// особенность sveltkit, недоступность локалсторэджа при отсутствии проверки на работу в браузере, а не на серверной части
const isBrowser = typeof window !== 'undefined';

const storedRole = isBrowser ? localStorage.getItem('userRole') : null;
export const role = writable(storedRole);

role.subscribe((value) => {
  if (isBrowser) {
    if (value) {
      localStorage.setItem('userRole', value);
    } else {
      localStorage.removeItem('userRole');
    }
  }
});