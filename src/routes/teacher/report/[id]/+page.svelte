<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    let report = null;
    let loading = true;
    let error = '';
  
    $: reportId = $page.params.id;
  
    const resultMap = {
      done: 'Выполнено',
      process: 'В процессе',
      passed: 'Сдано',
      in_work: 'В работе'
    };
  
    onMount(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/report/${reportId}/`);
        if (!res.ok) throw new Error('Ошибка при загрузке отчета');
        report = await res.json();
      } catch (e) {
        error = e.message;
      } finally {
        loading = false;
      }
    });
  
    function goBack() {
      goto('/teacher/');
    }
  </script>
  
  <div class="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
    <h2 class="text-xl font-bold mb-4">Просмотр отчёта</h2>
  
    {#if loading}
      <p>Загрузка...</p>
    {:else if error}
      <p class="text-red-500">{error}</p>
    {:else}
      <div class="space-y-3 mb-6">
        <div><strong>Мероприятие:</strong> {report.event_name}</div>
        <div><strong>Описание:</strong> {report.about_event}</div>
        <div><strong>Дата:</strong> {report.date}</div>
        <div><strong>Участники:</strong> {report.members}</div>
        <div><strong>Результат:</strong> {resultMap[report.result]}</div>
        <div><strong>Доказательства:</strong> {report.proofs}</div>
        <div>
            <strong>Критерии:</strong>
            <ul class="list-disc list-inside">
              {#each report.criteria as crit}
                <li>{crit.name} ({crit.point} балла)</li>
              {/each}
            </ul>
        </div>
      </div>
  
      <button on:click={goBack} class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
        ⬅ Назад к списку
      </button>
    {/if}
  </div>
  