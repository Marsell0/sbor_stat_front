<script>
    import { onMount } from 'svelte';
    import html2canvas from 'html2canvas';
    import { fly } from 'svelte/transition';
    import { writable } from 'svelte/store';
  
    let month = '';
    const reports = writable([]);
    const loading = writable(false);
    const error = writable('');
    const reportImage = writable('');
  
    let tableRef;
  
    const API_BASE = 'http://localhost:8000/api';
  
    async function fetchReport() {
      error.set('');
      loading.set(true);
      reportImage.set('');
      try {
        const res = await fetch(`${API_BASE}/pck-report/?month=${month}`);
        if (!res.ok) throw new Error('Ошибка загрузки отчета');
        const data = await res.json();
        reports.set(data);
        
        await tick();
        await generateImage();
      } catch (e) {
        error.set(e.message);
      } finally {
        loading.set(false);
      }
    }
  
    async function generateImage() {
      if (!tableRef) return;
      try {
        const canvas = await html2canvas(tableRef, { backgroundColor: '#fff' });
        reportImage.set(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error(e);
      }
    }
  
    function downloadExcel() {
      window.location.href = `${API_BASE}/pck-report/excel/?month=${month}`;
    }
  
    onMount(() => {
      const now = new Date();
      month = now.toISOString().slice(0, 7);
      fetchReport();
    });
  </script>
  
  <style>
    .controls { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .table-container { overflow-x: auto; }
    .report-image { max-width: 100%; border: 1px solid #ddd; margin-top: 1rem; }
    .popup { position: fixed; top: 1rem; right: 1rem; background: #16a34a; color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000; }
  </style>
  
  <div class="controls">
    <label>
      Месяц отчетности:
      <input type="month" bind:value={month} on:change={fetchReport} class="border rounded px-2 py-1" />
    </label>
    <button on:click={fetchReport} class="bg-blue-500 text-white px-4 py-2 rounded">Обновить</button>
    <button on:click={downloadExcel} class="bg-green-500 text-white px-4 py-2 rounded">Скачать Excel</button>
  </div>
  
  {#if $loading}
    <p>Загрузка отчета...</p>
  {:else if $error}
    <p class="text-red-500">{$error}</p>
  {:else}
    <div class="table-container" bind:this={tableRef}>
      <table class="table-auto w-full border-collapse border">
        <thead>
          <tr class="bg-gray-100">
            <th class="border px-4 py-2">Преподаватель</th>
            <th class="border px-4 py-2">Мероприятие</th>
            <th class="border px-4 py-2">Выполненные критерии</th>
          </tr>
        </thead>
        <tbody>
          {#each $reports as rpt}
            <tr>
              <td class="border px-4 py-2">{rpt.user}</td>
              <td class="border px-4 py-2">{rpt.event_name}</td>
              <td class="border px-4 py-2">{rpt.criteria.map(c => c.name).join(', ')}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  
    {#if $reportImage}
      <img src="{$reportImage}" alt="Отчет ПЦК" class="report-image" />
    {/if}
  {/if}