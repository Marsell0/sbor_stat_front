<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let reports = [];
  let username = ''

  onMount(async () => {
    username = localStorage.getItem('userName');
    const res = await fetch('http://localhost:8000/api/user_reports/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    reports = await res.json();
  });

  function editReport(id) {
    goto(`/teacher/report/${id}`);
  }
</script>

<div class="max-w-5xl mx-auto p-6">
  <h2 class="text-xl font-bold mb-4">Мои отчёты</h2>
  <table class="w-full table-auto border">
    <thead>
      <tr class="bg-gray-100">
        <th class="border px-3 py-2">Мероприятие</th>
        <th class="border px-3 py-2">Дата</th>
        <th class="border px-3 py-2">Статус</th>
        <th class="border px-3 py-2">Действие</th>
      </tr>
    </thead>
    <tbody>
      {#each reports as report}
        <tr>
          <td class="border px-3 py-2">{report.event_name}</td>
          <td class="border px-3 py-2">{report.date}</td>
          <td class="border px-3 py-2">{report.result}</td>
          <td class="border px-3 py-2 text-center">
            {#if report.editable}
              <button
                class="bg-blue-600 text-white px-3 py-1 rounded"
                on:click={() => editReport(report.id)}
              >
                Редактировать
              </button>
            {:else}
              <span class="text-gray-500">Просмотр</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>