(function(){
  const body = document.body;
  function createAuthModal(){
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'modal auth-modal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `
      <div class="modal-dialog">
        <button class="modal-close" id="authClose">×</button>
        <div class="modal-content inner">
          <h3>Вход / Регистрация</h3>
          <form id="authForm" class="auth-form">
            <input name="username" placeholder="Имя пользователя" />
            <input name="email" type="email" placeholder="Email" />
            <input name="password" type="password" placeholder="Пароль" />
            <div class="form-actions">
              <button type="submit">Зарегистрироваться</button>
              <button type="button" id="authCancel">Отмена</button>
            </div>
          </form>
        </div>
      </div>`;
    body.appendChild(modal);
    return modal;
  }

  let modal = null;
  function openAuth(){ if(!modal) modal = createAuthModal(); modal.setAttribute('aria-hidden','false'); }
  function closeAuth(){ if(modal) modal.setAttribute('aria-hidden','true'); }

  window.addEventListener('showAuth', ()=> openAuth());
  window.addEventListener('click',(e)=>{ if(modal && e.target === modal) closeAuth(); });
  window.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') closeAuth(); });
  window.addEventListener('submit',(e)=>{
    if(e.target && e.target.id === 'authForm'){
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      console.log('Auth form (UI-only):', data);
      closeAuth();
    }
  });
})();