<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { userPCK } from '$lib/globals';

  let teachers = [];
  let username = '';
  let password = '';
  let message = '';
  let error = '';

  async function loadTeachers() {
    const res = await fetch('http://localhost:8000/api/teachers/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pck: get(userPCK)
      })
    });
    teachers = await res.json();
  }

  async function createTeacher() {
    message = '';
    error = '';
    const res = await fetch('http://localhost:8000/api/register-teacher/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, pck: get(userPCK) })
    });

    const data = await res.json();
    if (res.ok) {
      message = data.message;
      username = '';
      password = '';
      await loadTeachers();
    } else {
      error = data.error || 'Ошибка при создании';
    }
  }

  onMount(loadTeachers);
</script>

{#if message}
  <div class="mt-2 text-green-600">{message}</div>
{/if}
{#if error}
  <div class="mt-2 text-red-600">{error}</div>
{/if}

<h3 class="text-lg font-semibold mb-2">Добавить преподавателя</h3>

<div class="mt-4 flex gap-4 items-center">
  <input bind:value={username} placeholder="Имя пользователя" class="border px-2 py-1 rounded" />
  <input type="password" bind:value={password} placeholder="Пароль" class="border px-2 py-1 rounded" />

  <button on:click={createTeacher} class="bg-blue-600 text-white px-4 py-2 rounded">
    ➕ Добавить
  </button>
</div>



<h2 class="text-xl font-bold mb-4">Преподаватели моего ПЦК</h2>

<table class="w-full border table-auto mb-6">
  <thead class="bg-gray-100">
    <tr>
      <th class="border px-3 py-2">Имя пользователя</th>
    </tr>
  </thead>
  <tbody>
    {#each teachers as t}
      <tr>
        <td class="border px-3 py-2">{t.username}</td>
      </tr>
    {/each}
  </tbody>
</table>




