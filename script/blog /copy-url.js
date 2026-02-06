document.addEventListener('DOMContentLoaded', function() {
  const copyButtons = document.querySelectorAll('[data-copy-url]');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (err) {
        // 
      }
    });
  });
});
