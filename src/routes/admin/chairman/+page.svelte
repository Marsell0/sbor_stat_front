<script lang="ts">
    import { onMount } from 'svelte';
  
    const pckOptions = [
      { value: 'it', label: 'Информационные технологии' },
      { value: 'eco', label: 'Экономические дисциплины' },
      { value: 'gen', label: 'Общеобразовательные дисциплины' },
      { value: 'cre', label: 'Креативные индустрии' }
    ];
  
    let teachers = [];
    let selectedPCK = 'it';
    let selectedTeacherId = '';
    let assignMessage = '';
    let errorMessage = '';
  
    let newUsername = '';
    let newPassword = '';
    let newPCK = 'it';
    let createMessage = '';
    let createError = '';

    const pckLabels: Record<string, string> = {
        it: 'Информационные технологии',
        eco: 'Экономические дисциплины',
        gen: 'Общеобразовательные дисциплины',
        cre: 'Креативные индустрии'
        };

  
    async function fetchTeachers() {
      const res = await fetch('http://localhost:8000/api/chairman/teachers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pck: selectedPCK })
      });
      teachers = await res.json();
    }
  
    async function assignAsHead() {
      assignMessage = '';
      errorMessage = '';
      const res = await fetch('http://localhost:8000/api/admin/assign-chairman/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedTeacherId, pck: selectedPCK })
      });
      const data = await res.json();
      if (res.ok) {
        assignMessage = data.message;
        loadChairs()
        await fetchTeachers();
      } else {
        errorMessage = data.error || 'Ошибка назначения';
      }
    }
  
    async function createNewHead() {
      createMessage = '';
      createError = '';
      const res = await fetch('http://localhost:8000/api/admin/create-chairman/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, pck: newPCK })
      });
      const data = await res.json();
      if (res.ok) {
        createMessage = data.message;
        newUsername = '';
        newPassword = '';
        loadChairs()
      } else {
        createError = data.error || 'Ошибка создания';
      }
    }

    let pckChairmans = [];
    let actionMessage = '';

    async function loadChairs() {
        const res = await fetch('http://localhost:8000/api/admin/pck-chairmans');
        pckChairmans = await res.json();
    }

    async function removeChair(id: number) {
        const res = await fetch('http://localhost:8000/api/admin/remove-chairman/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: id })
        });
        const data = await res.json();
        if (res.ok) {
        actionMessage = data.message;
        await loadChairs();
        } else {
        errorMessage = data.error || 'Ошибка';
        }
    }

    async function deleteUser(id: number) {
        if (!confirm('Удалить пользователя?')) return;
        const res = await fetch(`http://localhost:8000/api/admin/delete-user/${id}/`, {
        method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
        actionMessage = data.message;
        await loadChairs();
        } else {
        errorMessage = data.error || 'Ошибка удаления';
        }
    }
  
    onMount(() =>{
        fetchTeachers()
        loadChairs()
    });
  </script>
  
  <h2 class="text-xl font-bold mb-4">Назначение преподавателя председателем ПЦК</h2>
  
  <div class="grid md:grid-cols-2 gap-6 mb-6">
    <div class="p-4 border rounded shadow">
      <label class="block mb-2">ПЦК:
        <select bind:value={selectedPCK} on:change={fetchTeachers} class="border rounded p-1 w-full">
          {#each pckOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>
  
      <label class="block mb-2 mt-2">Выберите преподавателя:
        <select bind:value={selectedTeacherId} class="border rounded p-1 w-full">
          <option value="">-- Выберите --</option>
          {#each teachers as t}
            <option value={t.id}>{t.username}</option>
          {/each}
        </select>
      </label>
  
      <button on:click={assignAsHead} class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Назначить председателем
      </button>
  
      {#if assignMessage}
        <div class="mt-2 text-green-600">{assignMessage}</div>
      {/if}
      {#if errorMessage}
        <div class="mt-2 text-red-600">{errorMessage}</div>
      {/if}
    </div>
  
    <div class="p-4 border rounded shadow">
      <h3 class="font-semibold mb-2">Создание нового председателя</h3>
  
      <label class="block mb-2">Имя пользователя:
        <input bind:value={newUsername} class="border rounded p-1 w-full" />
      </label>
  
      <label class="block mb-2">Пароль:
        <input type="password" bind:value={newPassword} class="border rounded p-1 w-full" />
      </label>
  
      <label class="block mb-2">ПЦК:
        <select bind:value={newPCK} class="border rounded p-1 w-full">
          {#each pckOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>
  
      <button on:click={createNewHead} class="mt-4 bg-green-600 text-white px-4 py-2 rounded">
        Создать председателя
      </button>
  
      {#if createMessage}
        <div class="mt-2 text-green-600">{createMessage}</div>
      {/if}
      {#if createError}
        <div class="mt-2 text-red-600">{createError}</div>
      {/if}
    </div>
  </div>
  <h2 class="text-xl font-bold mb-4">Председатели ПЦК</h2>

{#if actionMessage}
  <div class="text-green-600 mb-2">{actionMessage}</div>
{/if}
{#if errorMessage}
  <div class="text-red-600 mb-2">{errorMessage}</div>
{/if}

<table class="w-full border table-auto mb-6">
  <thead class="bg-gray-100">
    <tr>
      <th class="border px-3 py-2">Имя пользователя</th>
      <th class="border px-3 py-2">ПЦК</th>
      <th class="border px-3 py-2">Действия</th>
    </tr>
  </thead>
  <tbody>
    {#each pckChairmans as h}
      <tr>
        <td class="border px-3 py-2">{h.username}</td>
        <td class="border px-3 py-2">{pckLabels[h.pck] || h.pck}</td>
        <td class="border px-3 py-2 space-x-2">
          <button on:click={() => removeChair(h.id)} class="text-yellow-600 underline">Снять</button>
          <button on:click={() => deleteUser(h.id)} class="text-red-600 underline">Удалить</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
  