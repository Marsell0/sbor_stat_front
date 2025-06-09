<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    const pck = localStorage.getItem('userPCK')
  
    onMount(() => {
      const role = localStorage.getItem('userRole');
      if (role !== 'teacher') {
        goto('/');
      }
    });
  
    function logout() {
      localStorage.clear();
      goto('/');
    }
  </script>
  
  <div class="flex h-screen">
    <aside class="w-64 bg-gray-100 p-4">
      <h2 class="font-bold mb-4">Преподаватель {pck}</h2>
      <ul class="space-y-2">
        <li><a href="/teacher">Главная</a></li>
        <li><a href="/teacher/report">Новый отчет</a></li>
      </ul>
      <button on:click={logout} class="mt-4 text-sm text-red-500">Выйти</button>
    </aside>
  
    <main class="flex-1 p-6 bg-white">
      <slot />
    </main>
  </div>