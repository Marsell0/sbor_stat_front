<script>
    import { onMount } from 'svelte';
  
    let eventName = '';
    let aboutEvent = '';
    let date = '';
    let members = '';
    let result = 'process';
    let proofs = '';
    let criteria = [];
    let selectedCriteria = new Set();
    let username = localStorage.getItem('userName'); // или из localStorage
  
    let error = '';
    let success = false;
  
    const resultOptions = [
      { value: 'done', label: 'Выполнено' },
      { value: 'process', label: 'В процессе' },
      { value: 'passed', label: 'Сдано' },
      { value: 'in_work', label: 'В работе' }
    ];
  
    onMount(async () => {
      const res = await fetch('http://localhost:8000/api/criteria/');
      criteria = await res.json();
    });
  
    async function submit() {
      const response = await fetch('http://localhost:8000/api/create_report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          event_name: eventName,
          about_event: aboutEvent,
          date,
          members,
          result,
          proofs,
          criteria: Array.from(selectedCriteria)
        })
      });
  
      if (response.ok) {
        success = true;
        error = '';
        eventName = aboutEvent = members = proofs = '';
        selectedCriteria.clear();
      } else {
        const data = await response.json();
        error = data?.error || 'Ошибка при отправке';
      }
    }
  
    function toggleCriteria(id) {
      selectedCriteria.has(id) ? selectedCriteria.delete(id) : selectedCriteria.add(id);
    }
  </script>
  
  <div class="max-w-2xl mx-auto p-6 bg-white shadow rounded">
    <h2 class="text-xl font-semibold mb-4">Добавить отчет</h2>
  
    {#if success}
      <div class="text-green-600 mb-4">Отчет успешно добавлен</div>
    {/if}
    {#if error}
      <div class="text-red-600 mb-4">{error}</div>
    {/if}
  
    <input bind:value={eventName} placeholder="Название мероприятия" class="input" />
    <textarea bind:value={aboutEvent} placeholder="Описание мероприятия" class="input" />
    <input type="date" bind:value={date} class="input" />
    <input bind:value={members} placeholder="Участники" class="input" />
  
    <select bind:value={result} class="input">
      {#each resultOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  
    <textarea bind:value={proofs} placeholder="Цифровой след (ссылки, текст)" class="input" />
  
    <div class="mt-4">
      <h3 class="mb-2">Выберите критерии:</h3>
      {#each criteria as crit}
        <div>
          <input type="checkbox" id={crit.id} on:change={() => toggleCriteria(crit.id)} />
          <label for={crit.id}>{crit.name} ({crit.point})</label>
        </div>
      {/each}
    </div>
  
    <button on:click={submit} class="bg-blue-600 text-white px-4 py-2 mt-4 rounded">Сохранить</button>
  </div>
  
  <style>
    .input {
      display: block;
      width: 100%;
      margin-bottom: 12px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>