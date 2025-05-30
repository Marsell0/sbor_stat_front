<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { getIP } from '$lib/globals'
  
    let ip = getIP()
    let eventName = '';
    let criteria = [];
    let selected = new Set();
    let success = false;
    let error = '';
  
    onMount(async () => {
      try {
        const res = await fetch(ip + '/api/criteria/', {

        });
        criteria = await res.json();
      } catch (e) {
        error = 'Не удалось загрузить критерии';
      }
    });
  
    async function submit() {
      const response = await fetch(ip + '/api/create_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          criteria: Array.from(selected)
        })
      });
  
      if (response.ok) {
        success = true;
        eventName = '';
        selected.clear();
      } else {
        const data = await response.json();
        error = data.detail || 'Ошибка при сохранении отчета';
      }
    }
  
    function toggle(id) {
      selected.has(id) ? selected.delete(id) : selected.add(id);
    }
  </script>
  
  <div class="max-w-xl mx-auto p-4 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Добавить отчет</h2>
  
    {#if success}
      <div class="bg-green-100 text-green-800 p-3 rounded mb-4">Отчет успешно сохранен</div>
    {/if}
    {#if error}
      <div class="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
    {/if}
  
    <label class="block mb-2">Название мероприятия</label>
    <input
      bind:value={eventName}
      class="border px-3 py-2 rounded w-full mb-4"
      placeholder="Введите название мероприятия" />
  
    <div class="mb-4">
      <label class="block mb-2">Выберите выполненные критерии:</label>
      {#each criteria as item}
        <div class="flex items-center mb-1">
          <input type="checkbox" id={`crit-${item.id}`} on:change={() => toggle(item.id)} checked={selected.has(item.id)} />
          <label for={`crit-${item.id}`} class="ml-2">{item.name} ({item.point} балл)</label>
        </div>
      {/each}
    </div>
  
    <button on:click={submit} class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
      Сохранить отчет
    </button>
  </div>
  