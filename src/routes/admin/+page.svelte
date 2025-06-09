<script>
    import { onMount } from 'svelte';
    import { get, writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { getIP } from '$lib/globals'
    import { fly, fade } from 'svelte/transition';
  
    const criteria = writable([]);
    const loading = writable(true);
    const error = writable(null);
    let editCriterion = null;
    let successMessage = '';
    let showPopup = false;
    const ip = getIP()
    let newCriterion = { name: '', point: '' };

    let currentPage = 1;
    const pageSize = 10;
  
    async function fetchCriteria() {
      loading.set(true);
      try {
        const res = await fetch(ip + '/api/criteria/');
        if (!res.ok) throw new Error('Ошибка загрузки критериев');
        const data = await res.json();
        criteria.set(data);
        console.log(data)
      } catch (e) {
        error.set(e.message);
      } finally {
        loading.set(false);
      }
    }
  
    const addCriterion = async () => {
    const res = await fetch(ip + '/api/criteria/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCriterion),
    });
    if (res.ok) {
      newCriterion = { name: '', point: '' };
      showSuccess('Критерий добавлен');
      await fetchCriteria();
    }
  };
  const saveEdit = async () => {
    const res = await fetch(ip + `${editCriterion.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editCriterion),
    });
    if (res.ok) {
      editCriterion = null;
      showSuccess('Критерий обновлён');
      await fetchCriteria();
    }
  };

  const startEdit = (item) => {
    editCriterion = { ...item }; // клон объекта
  };

  const cancelEdit = () => {
    editCriterion = null;
  };

  const showSuccess = (message) => {
    successMessage = message;
    showPopup = true;
    setTimeout(() => {
      showPopup = false;
    }, 3000);
  };
  
    async function updateCriterion(criterion) {
      try {
        const res = await fetch(ip + `/api/criteria/${criterion.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(criterion)
        });
        if (!res.ok) throw new Error('Ошибка при обновлении критерия');
        await fetchCriteria();
      } catch (e) {
        alert(e.message);
      }
    }
    async function deleteCriterion(id) {
    if (!confirm('Вы уверены, что хотите удалить критерий?')) return;
    try {
      const res = await fetch(ip + `/api/criteria/${id}/`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Ошибка при удалении критерия');
      showSuccess('Критерий удалён');
      await fetchCriteria();
    } catch (e) {
      alert(e.message);
    }
  }


  $: paginatedCriteria = $criteria.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  $: totalPages = Math.ceil($criteria.length / pageSize);
  
    onMount(() => {
      const role = localStorage.getItem('userRole');
      if (role !== 'admin') {
        goto('/');
      }
      fetchCriteria()
    });
  </script>
  
  {#if showPopup}
  <div class="popup" in:fly={{ y: -20 }} out:fade>
    ✅ {successMessage}
  </div>
  {/if}

  <h1 class="text-xl font-bold mb-4">Управление критериями</h1>
  
  {#if $loading}
    <p>Загрузка...</p>
  {:else if $error}
    <p class="text-red-500">{$error}</p>
  {:else}
  
  <div class="mt-6">
    <h2 class="font-semibold mb-2">Добавить новый критерий</h2>
    <input
      class="border rounded px-2 py-1 mr-2"
      placeholder="Название"
      bind:value={newCriterion.name}
    />
    <input
      class="border rounded px-2 py-1 mr-2"
      placeholder="Балл"
      type="number"
      step="0.01"
      bind:value={newCriterion.point}
    />
    <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={addCriterion}>Добавить</button>
  </div>

    <table class="table-auto w-full border">
      <thead>
        <tr class="bg-gray-100">
          <th class="px-4 py-2">Название</th>
          <th class="px-4 py-2">Балл</th>
          <th class="px-4 py-2">Действия</th>
        </tr>
      </thead>
      <tbody>
        {#each paginatedCriteria as criterion (criterion.id)}
          <tr class="border-t">
            <td class="px-4 py-2">
              <input class="border px-2 py-1 w-full" bind:value={criterion.name} />
            </td>
            <td class="px-4 py-2">
              <input class="border px-2 py-1 w-full" type="number" step="0.01" bind:value={criterion.point} />
            </td>
            <td class="px-4 py-2 space-x-2">
              <button class="bg-yellow-500 text-white px-3 py-1 rounded" on:click={() => updateCriterion(criterion)}>Сохранить</button>
              <button class="bg-red-500 text-white px-3 py-1 rounded" on:click={() => deleteCriterion(criterion.id)}>Удалить</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  
    <div class="flex justify-between mt-4">
      <button class="bg-gray-300 px-3 py-1 rounded" on:click={() => currentPage--} disabled={currentPage === 1}>Назад</button>
      <span>Страница {currentPage} из {totalPages}</span>
      <button class="bg-gray-300 px-3 py-1 rounded" on:click={() => currentPage++} disabled={currentPage === totalPages}>Вперёд</button>
    </div>
  

  {/if}

<style>
  .popup {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #16a34a;
    color: white;
    padding: 1em 1.5em;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 999;
    font-weight: bold;
  }
  </style>