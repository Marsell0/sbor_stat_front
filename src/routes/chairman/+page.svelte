<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { getIP } from '$lib/globals'
  
    let username = '';
    let password = '';
    let showPopup = false;
    let ip = getIP()
    const teachers = writable([]);
    const successMessage = writable('');
    const errorMessage = writable('');
    let selectedMonth = '';
  
    async function registerTeacher() {
      try {
        const res = await fetch(ip + '/api/register-teacher/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
  
        if (!res.ok) throw new Error('Ошибка при регистрации преподавателя');
        username = '';
        password = '';
        successMessage.set('Преподаватель зарегистрирован');
        showPopup()
        fetchTeachers(); // обновим список
      } catch (err) {
        errorMessage.set(err.message);
      } finally {
        setTimeout(() => {
          successMessage.set('');
          errorMessage.set('');
        }, 2000);
      }
    }
  
    async function fetchTeachers() {
      const res = await fetch(ip + '/api/teachers/');
      if (res.ok) {
        const data = await res.json();
        teachers.set(data);
      }
    }
  
    async function fetchReport() {

    }

    const showSuccess = (message) => {
    showPopup = true;
    setTimeout(() => {
      showPopup = false;
    }, 3000);
  };
  
    onMount(fetchTeachers);
  </script>
  
  <h1 class="text-2xl font-bold mb-4">Панель председателя ПЦК</h1>
  
  
  <div class="mb-6">
    {#if showPopup}
    <div class="popup" in:fly={{ y: -20 }} out:fade>
      ✅ {successMessage}
    </div>
    {/if}
    <h2 class="text-lg font-semibold mb-2">Регистрация преподавателя</h2>
    <input placeholder="Имя пользователя" class="border px-2 py-1 mr-2" bind:value={username} />
    <input placeholder="Пароль" type="password" class="border px-2 py-1 mr-2" bind:value={password} />
    <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={registerTeacher}>Зарегистрировать</button>
  </div>
  
  <div class="mb-6">
    <h2 class="text-lg font-semibold mb-2">Отчетность по ПЦК</h2>
    <input type="month" bind:value={selectedMonth} class="border px-2 py-1 mr-2" />
    <button class="bg-green-500 text-white px-4 py-2 rounded" on:click={fetchReport}>Скачать отчет</button>
  </div>
  
  <div>
    <h2 class="text-lg font-semibold mb-2">Список преподавателей</h2>
    <ul class="list-disc pl-6">
      {#each $teachers as teacher}
        <li>{teacher.username}</li>
      {/each}
    </ul>
  </div>
  