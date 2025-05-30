<script>
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
  </div>
  