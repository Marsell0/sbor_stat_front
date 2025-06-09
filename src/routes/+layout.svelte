<script>
	import '../app.css';
	
	let { children } = $props();
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    const pathname = window.location.pathname;

    const role = localStorage.getItem('userRole');
    if (!role && pathname !== '/') {
      goto('/');
    }

    if (pathname === '/' && role) {
      if (role === 'admin') goto('/admin');
      else if (role === 'teacher') goto('/teacher');
      else if (role === 'chairman') goto('/chairman');
    }
  });
</script>

{@render children()}
