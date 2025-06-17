<script>
    import { onMount } from 'svelte';
    import { userPCK, initAuthFromLocalStorage, userRole, userName } from '$lib/globals';
    import { get } from 'svelte/store';
  
    let reports = [];
    let selectedMonth = new Date().getMonth() + 1;
    let selectedYear = new Date().getFullYear();
    let successMsg = '';
    let filter = 'all';

    let teachers = [];
    let selectedTeacher = 'all';

    const months = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];


    function mapResult(result) {
        const map = {
            done: 'Выполнено',
            process: 'В процессе',
            passed: 'Сдано',
            in_work: 'В работе'
        };
        return map[result] || result;
    }
    async function markChecked(id) {
        const res = await fetch(`http://localhost:8000/api/chairman/check/${id}/`, {
            method: 'POST'
        });

        if (res.ok) {
            reports = reports.map(r => r.id === id ? { ...r, checked_by_head: true } : r);
        }
        }


  
    onMount(async () => {
        initAuthFromLocalStorage(); 

        const res = await fetch('http://localhost:8000/api/criteria/');
        allCriteria = await res.json();

        fetchTeachers()
        fetchReports();
    });
  
    async function fetchTeachers() {
      const pck = get(userPCK);
      const res = await fetch('http://localhost:8000/api/chairman/teachers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pck })
      });

      teachers = await res.json();
    }

    async function fetchReports() {
      const pck = get(userPCK);
      const res = await fetch('http://localhost:8000/api/chairman/reports/filter/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pck, month: selectedMonth, year: selectedYear })
      });
      
      reports = await res.json();

      
    }
  
    async function exportExcel() {
      const res = await fetch('http://localhost:8000/api/chairman/reports/export/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pck: get(userPCK),
          month: selectedMonth,
          year: selectedYear,
          teacher_id: selectedTeacher !== 'all' ? Number(selectedTeacher) : null,
          checked_only: filter === 'checked'
        })
      });
      console.log(selectedTeacher !== 'all' ? Number(selectedTeacher) : null)

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Отчеты_${selectedMonth}_${selectedYear}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    }



    $: filteredReports = reports.filter(r => {
      const isChecked =
        filter === 'checked' ? r.checked_by_head :
        filter === 'unchecked' ? !r.checked_by_head :
        true;

      const byTeacher =
        selectedTeacher === 'all' || r.user_id === Number(selectedTeacher);

      return isChecked && byTeacher;
    });

  let showModal = false;
  let editingReport = null;
  let updatedData = {};
  let errorMessage = '';
  let allCriteria = [];

  function openEditModal(report) {
    editingReport = { ...report };
    updatedData = {
      event_name: report.event_name,
      result: report.result,
      about_event: report.about_event,
      members: report.members,
      proofs: report.proofs,
      checked_by_head: report.checked_by_head,
      criteria: report.criteria?.map(c => c.id) || []
    };
    showModal = true;
    errorMessage = '';
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
        role: get(userRole),
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

  function canEdit(report) {
    const role = get(userRole);
    const user = get(userName);

    if (role === 'chairman') return true;
    if (role === 'teacher' && !report.checked_by_head && report.user === user) return true;

    return false;
  }

  function toggleCriterion(id) {
    if (updatedData.criteria.includes(id)) {
      updatedData.criteria = updatedData.criteria.filter(c => c !== id);
    } else {
      updatedData.criteria = [...updatedData.criteria, id];
    }
  }



  </script>
  
  <div class="mb-4 flex gap-4 items-end">
    <div>
      <label>Месяц:</label>
      <select bind:value={selectedMonth} class="border px-2 py-1 rounded">
        {#each months as m, i}
          <option value={i + 1}>{m}</option>
        {/each}
      </select>
    </div>
  
    <div>
      <label>Год:</label>
      <input type="number" bind:value={selectedYear} class="border px-2 py-1 rounded w-28" />
    </div>
  
    <button on:click={fetchReports} class="bg-blue-600 text-white px-4 py-2 rounded">
      🔍 Показать
    </button>
  
    <button on:click={exportExcel} class="bg-green-600 text-white px-4 py-2 rounded">
      ⬇ Экспорт в Excel
    </button>
  </div>
  
  <div class="mt-4 flex gap-4 items-center">
    <label>Фильтр по отмеченным:</label>
    <select bind:value={filter} class="border px-2 py-1 rounded">
      <option value="all">Все</option>
      <option value="checked">Только проверенные</option>
      <option value="unchecked">Только непроверенные</option>
    </select>
    <label>Фильтр по преподавателям:</label>
    <select bind:value={selectedTeacher} class="border px-2 py-1 rounded">
      <option value="all">Все</option>
      {#each teachers as t}
        <option value={t.id}>{t.username}</option>
      {/each}
    </select>
  </div>

    {#if filteredReports.length > 0}
    <table class="w-full table-auto border mt-6">
        <thead class="bg-gray-100">
        <tr>
            <th class="border px-3 py-2">Преподаватель</th>
            <th class="border px-3 py-2">Мероприятие</th>
            <th class="border px-3 py-2">Дата</th>
            <th class="border px-3 py-2">Результат</th>
            <th class="border px-3 py-2">Критерии</th>
            <th class="border px-3 py-2">Проверено</th>
            <th class="border px-3 py-2">Действие</th>
        </tr>
        </thead>
        <tbody>
        {#each filteredReports as r}
        <tr>
            <td class="border px-3 py-2">
              {#if teachers.length > 0}
                {#each teachers as t}
                  {#if t.id === r.user_id}
                    {t.username}
                  {/if}
                {/each}
              {/if}
            </td>          
            <td class="border px-3 py-2">{r.event_name}</td>
            <td class="border px-3 py-2">{r.date}</td>
            <td class="border px-3 py-2">{mapResult(r.result)}</td>
            <td class="border px-3 py-2">
              <ul class="list-disc list-inside text-sm">
                {#each r.criteria as crit}
                  <li>{crit.name} ({crit.point} балл{crit.point == 1 ? '' : 'ов'})</li>
                {/each}
              </ul>
            </td>            
            <td class="border px-3 py-2 text-center">{r.checked_by_head ? '✅' : '—'}</td>
            <td class="border px-3 py-2 text-center">
              {#if !r.checked_by_head}
                <button
                  on:click={() => markChecked(r.id)}
                  class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Отметить
                </button>
              {:else}
                <span class="text-gray-400">Проверено</span>
              {/if}
              {#if canEdit(r)}
                <button on:click={() => openEditModal(r)} class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Редактировать</button>
              {/if}
            </td>
        </tr>          
        {/each}
        </tbody>
    </table>
    {:else}
    <p class="mt-4 text-gray-500">Нет отчетов за выбранный период.</p>
    {/if}


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
                  on:change={() => toggleCriterion(crit.id)}
                />
                {crit.name} ({crit.point} балл{crit.point === 1 ? '' : 'ов'})
              </label>
            {/each}
          </div>


          {#if get(userRole) === 'chairman'}
            <label class="block mb-2">
              <input type="checkbox" bind:checked={updatedData.checked_by_head} />
              Отметить как проверено
            </label>
          {/if}

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



  
  