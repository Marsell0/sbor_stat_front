<script lang="ts">
  import { onMount } from 'svelte';
  import { userRole } from '$lib/globals';

  let reports = [];
  

  let showModal = false;
  let editingReport = null;
  let updatedData: any = {};
  let errorMessage = '';
  let allCriteria = [];

  const pckOptions = [
    { value: 'it', label: 'Информационные технологии' },
    { value: 'eco', label: 'Экономические дисциплины' },
    { value: 'gen', label: 'Общеобразовательные дисциплины' },
    { value: 'cre', label: 'Креативные индустрии' }
  ];
  let selectedPCK = 'it';


  onMount(async () => {
    await fetchCriteria();
    await fetchReports();
  });

  async function fetchCriteria() {
    const res = await fetch('http://localhost:8000/api/criteria/');
    allCriteria = await res.json();
  }

  async function fetchReports() {
    const res = await fetch('http://localhost:8000/api/admin/reports/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pck: selectedPCK })
    });
    reports = await res.json();
  }

  function openEditModal(report) {
    editingReport = { ...report };
    updatedData = {
      event_name: report.event_name,
      result: report.result,
      about_event: report.about_event,
      members: report.members,
      proofs: report.proofs,
      criteria: report.criteria?.map(c => c.id) || []
    };
    showModal = true;
    errorMessage = '';
  }

  async function exportAdminExcel() {
    const res = await fetch('http://localhost:8000/api/admin/reports/export/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pck: selectedPCK })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Отчеты_${selectedPCK}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }


  async function saveReport() {
    if (!updatedData.criteria || updatedData.criteria.length === 0) {
      errorMessage = 'Выберите хотя бы один критерий';
      return;
    }

    const res = await fetch(`http://localhost:8000/api/report/${editingReport.id}/edit/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updatedData,
        user_id: editingReport.user_id,
        role: 'admin'
      })
    });

    if (res.ok) {
      const updated = await res.json();
      reports = reports.map(r => r.id === updated.id ? updated : r);
      showModal = false;
    } else {
      const result = await res.json();
      errorMessage = result?.error || 'Ошибка при сохранении';
    }
  }
</script>

<div class="mb-4">
  <label class="block mb-2">ПЦК:</label>
  <select bind:value={selectedPCK} on:change={fetchReports} class="border p-1 rounded">
    {#each pckOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>


  <button on:click={exportAdminExcel} class="bg-green-600 text-white px-4 py-2 rounded">
    📥 Экспорт в Excel
  </button>
</div>



<table class="w-full table-auto border">
  <thead class="bg-gray-100">
    <tr>
      <th class="border px-3 py-2">Преподаватель</th>
      <th class="border px-3 py-2">Мероприятие</th>
      <th class="border px-3 py-2">Дата</th>
      <th class="border px-3 py-2">Результат</th>
      <th class="border px-3 py-2">Критерии</th>
      <th class="border px-3 py-2">Баллы</th>
      <th class="border px-3 py-2">Действие</th>
    </tr>
  </thead>
  <tbody>
    {#each reports as r}
      <tr>
        <td class="border px-3 py-2">{r.user}</td>
        <td class="border px-3 py-2">{r.event_name}</td>
        <td class="border px-3 py-2">{r.date}</td>
        <td class="border px-3 py-2">{r.result}</td>
        <td class="border px-3 py-2">
          <ul class="list-disc list-inside text-sm">
            {#each r.criteria as c}
              <li>{c.name} ({c.point})</li>
            {/each}
          </ul>
        </td>
        <td class="border px-3 py-2">{r.criteria.reduce((sum, c) => sum + c.point, 0)}</td>
        <td class="border px-3 py-2">
          <button on:click={() => openEditModal(r)} class="text-blue-600 underline">Редактировать</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#if showModal}
  <div class="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 shadow-lg w-full max-w-2xl">
      <h2 class="text-xl font-bold mb-4">Редактировать отчет</h2>

      <label class="block mb-2">Название мероприятия:
        <input bind:value={updatedData.event_name} class="border p-1 rounded w-full" />
      </label>

      <label class="block mb-2">Участники:
        <input bind:value={updatedData.members} class="border p-1 rounded w-full" />
      </label>

      <label class="block mb-2">Описание:
        <textarea bind:value={updatedData.about_event} class="border p-1 rounded w-full" rows="3" />
      </label>

      <label class="block mb-2">Результат:
        <select bind:value={updatedData.result} class="border p-1 rounded w-full">
          <option value="done">Выполнено</option>
          <option value="passed">Сдано</option>
          <option value="in_work">В работе</option>
          <option value="process">В процессе</option>
        </select>
      </label>

      <label class="block mb-2">Критерии:</label>
      <div class="grid grid-cols-2 gap-2 mb-4">
        {#each allCriteria as crit}
          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={updatedData.criteria.includes(crit.id)}
              on:change={() => {
                if (updatedData.criteria.includes(crit.id)) {
                  updatedData.criteria = updatedData.criteria.filter(c => c !== crit.id);
                } else {
                  updatedData.criteria = [...updatedData.criteria, crit.id];
                }
              }}
            />
            {crit.name} ({crit.point})
          </label>
        {/each}
      </div>

      {#if errorMessage}
        <div class="text-red-600 text-sm mb-2">{errorMessage}</div>
      {/if}

      <div class="flex justify-end gap-2 mt-4">
        <button on:click={() => showModal = false} class="px-4 py-2 bg-gray-300 rounded">Отмена</button>
        <button on:click={saveReport} class="px-4 py-2 bg-blue-600 text-white rounded">Сохранить</button>
      </div>
    </div>
  </div>
{/if}
