<!-- <script>
    import { role } from '$lib/globals';
    let username = '';
    let selectedRole = 'admin';
  
    function login() {
      if (username && selectedRole) {
        role.set(selectedRole);

        window.location.href = '/';
      } else {
        alert('Введите имя пользователя и выберите роль');
      }
    }
  </script>
  
  <div class="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
    <h1 class="text-xl font-bold mb-4">Вход</h1>
    <input
      placeholder="Имя пользователя"
      bind:value={username}
      class="border px-3 py-2 w-full mb-3 rounded"
    />
    <select bind:value={selectedRole} class="border px-3 py-2 w-full mb-3 rounded">
      <option value="admin">Администратор</option>
      <option value="chairman">Председатель ПЦК</option>
      <option value="teacher">Преподаватель</option>
    </select>
    <button on:click={login} class="bg-blue-500 text-white px-4 py-2 rounded w-full">
      Войти
    </button>
  </div> -->

  <script>
    import { goto } from '$app/navigation';
  
    let username = '';
    let password = '';
    let error = '';
  
    async function login() {
      error = '';
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      if (res.ok) {
        const profile = await fetch('http://localhost:8000/api/user-info/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: username })
        });
  
        if (profile.ok) {
          const user = await profile.json();
          localStorage.setItem('userRole', user.role);
          localStorage.setItem('userPCK', user.pck);
          localStorage.setItem('userName', user.username)
          if (user.role === 'admin'){
            goto('/admin'); 
          }else if (user.role === 'chairman'){
            goto('/chairman')
          }
          else{
            goto('/teacher')
          }
            
        } else {
          error = 'Ошибка при получении данных профиля';
        }
      } else {
        error = 'Неверные логин или пароль';
      }
    }
  </script>
  
  <div class="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
    <h1 class="text-xl font-bold mb-4">Вход</h1>
  
    {#if error}
      <div class="text-red-500 mb-4">{error}</div>
    {/if}
  
    <input bind:value={username} placeholder="Имя пользователя" class="border rounded px-3 py-2 w-full mb-3" />
    <input bind:value={password} type="password" placeholder="Пароль" class="border rounded px-3 py-2 w-full mb-4" />
    <button on:click={login} class="bg-blue-600 text-white px-4 py-2 w-full rounded">Войти</button>
  </div>
  