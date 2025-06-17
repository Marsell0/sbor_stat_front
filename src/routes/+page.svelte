
  <script>
    import { goto } from '$app/navigation';
    import { userName, userRole, userPCK } from '$lib/globals';

  
    let inputUsername = '';
    let inputPassword = '';
    let error = '';
  
    async function login() {
      error = '';
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: inputUsername, password: inputPassword })
      });
      if (res.ok) {
        const profile = await fetch('http://localhost:8000/api/user-info/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: inputUsername })
        });
        console.log(profile)
        if (profile.ok) {
          const user = await profile.json();
          localStorage.setItem('userName', user.username);
          localStorage.setItem('userRole', user.role);
          localStorage.setItem('userPCK', user.pck);
          console.log(user.username)
          userName.set(user.username);
          userRole.set(user.role);
          userPCK.set(user.pck);
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
  
    <input bind:value={inputUsername} placeholder="Имя пользователя" class="border rounded px-3 py-2 w-full mb-3" />
    <input bind:value={inputPassword} type="password" placeholder="Пароль" class="border rounded px-3 py-2 w-full mb-4" />
    <button on:click={login} class="bg-blue-600 text-white px-4 py-2 w-full rounded">Войти</button>
  </div>
  