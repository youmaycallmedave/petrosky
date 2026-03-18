
const cookieBanner = document.querySelector("[data-cookie-banner]");
  const allowCookieBtn = document.querySelector("[data-cookie-allow]");
  // const denyCookieBtn = document.querySelector("[data-cookie-deny]");
  const closeCookieBtn = document.querySelector("[data-cookie-close]");

  const getCookie = (name) => {
      for (const entryStr of document.cookie.split('; ')) {
          const [entryName, entryValue] = entryStr.split('=')

          if(decodeURIComponent(entryName) === name) {
              return decodeURIComponent(entryValue)
          }
      }
  }

  if(getCookie('cookieConsern') == 'allow' || getCookie('cookieConsern') === 'deny') {
      console.log("cookie is set")
  } else {
      setTimeout(() => {
          cookieBanner.classList.add("is-active");
      }, 3000);
  }

  // console.log('cookieConsern:', getCookie('cookieConsern'));

  //Version without Expires Date
  // const setCookie = (name, value) => {
  //     document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  // }


  //Version with Expires Date
  const setCookie = (name, value, days = 7) => {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${expires}; path=/`;
  }

  function allowCookie() {
      setCookie('cookieConsern', 'allow')
      closeCookieBanner();
  }

  // function denyCookie() {
  //     setCookie('cookieConsern', 'deny')
  //     closeCookieBanner();
  // }

  function closeCookieBanner() {
      cookieBanner.classList.remove("is-active")
  }

  allowCookieBtn.addEventListener("click", allowCookie);
  // denyCookieBtn?.addEventListener("click", denyCookie);
  closeCookieBtn.addEventListener("click", closeCookieBanner);
