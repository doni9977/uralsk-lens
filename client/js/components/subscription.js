document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.subscribe');
  const emailInput = document.getElementById('email');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value;

      console.log('Request sending to:', email);

      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
          alert('Письмо успешно отправлено на ' + email);
          emailInput.value = '';
        } else {
          alert('Ошибка сервера: ' + data.message);
        }
      } catch (err) {
        console.error('Ошибка fetch:', err);
        alert('Не удалось связаться с сервером. Проверь консоль.');
      }
    });
  }
});