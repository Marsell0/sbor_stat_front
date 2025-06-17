export let server_http = "http://localhost:8000"

export function getIP() {
    return server_http
  }

  import { writable } from 'svelte/store';

  export const userName = writable('');
  export const userRole = writable('');
  export const userPCK = writable('');
  
  export function initAuthFromLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      userName.set(localStorage.getItem('username') || '');
      userRole.set(localStorage.getItem('userRole') || '');
      userPCK.set(localStorage.getItem('userPCK') || '');
    }
  }
  
  export function clearAuth() {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    userName.set('');
    userRole.set('');
    userPCK.set('');
  }
  