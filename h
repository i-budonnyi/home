[33mc7df8e6[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m 🪵 Debug: додано логування запиту та відповіді для проблеми 500
[33ma3cf1fe[m 🚑 Fix Netlify build: видалено невикористаний USER_API_URL
[33m489293c[m 🐛 Fix: видалено user_id з запиту при створенні проблеми (отримується з токена)
[33m684a648[m 🔍 Add logs to debug sanitizeText output
[33m3e07fc5[m 🔧 Повний редизайн WorkerPage + sanitizeText + CORS + notify
[33mc304e07[m ?? sanitizeText:
[33m1912067[m gop
[33m4aacb1c[m nnhx
[33m6e16749[m oi
[33m8603f23[m jfj
[33m96f2e21[m sd56
[33mf510f5f[m sdjw
[33m56be689[m 646
[33mbaaf57a[m fix: правильна інтеграція з бекендом /notification через req.user.id, без user_id у body
[33mb9f6c05[m fix: передача user_id в body для /notification + повний редизайн WorkerPage без  помилки
[33m86adffa[m jdi
[33mffe52db[m 7873
[33m8c2c4c2[m 090989898
[33mfb0dba8[m yop
[33m2d196be[m 283
[33m8596b82[m 738
[33mb83f95c[m roll
[33m25bda4e[m 97899
[33m2ebb105[m 0329
[33mfa0ba5b[m 87
[33md994b99[m uw
[33m2d19915[m jpk
[33m82fe86e[m podol
[33mf65431a[m 86274
[33mf453176[m 776
[33mf6c3c54[m 090
[33m409c7fe[m njn009i
[33m93e8240[m kjikj
[33mf8321c0[m fsjekf
[33mbc43f55[m  header
[33m979a785[m 98490
[33m76f37f5[m 09090
[33m873db20[m 343
[33mbfdf9f9[m jdoe
[33mfee62e4[m 233
[33m5656f45[m oid
[33m405532b[m opiq
[33m536aafd[m fixwork
[33m24d42a8[m wsd
[33mb05d2dc[m ф?кс
[33m483ab2e[m dsa
[33mfb275c6[m sfh
[33mc4159e7[m irwi
[33m08e9103[m 763756
[33me90c0c5[m ywiu
[33mfbab012[m 123445
[33m735a66f[m dvu
[33m5ea3f13[m 1234
[33m3458f04[m 1size
[33m4cb6355[m workpage
[33meba3878[m fixed
[33m8d5b913[m design2
[33ma67e049[m 234
[33ma9c0dd3[m sdw
[33mb2e0a15[m aqw
[33mc132a57[m notification
[33mde68bce[m design
[33m1f979ad[m VTR
[33mecf3ced[m turn right
[33mef9704a[m fixeq
[33m09a1522[m testing
[33m74a66d8[m saq
[33m738635f[m djj
[33m41bac45[m fix
[33m64f0288[m login page
[33m6fe0eec[m Login
[33mc6e85b3[m ifjf
[33m7ac22d3[m 123
[33m255ba2e[m  виправлена статус пуш
[33mcdc8e6a[m fix: виправлено відображення імені автора коментаря та обробку поточного користувача
[33ma2d23b0[m fix: оновлено логіку завантаження та відображення коментарів
[33m512888e[m fix: виправлено логіку завантаження та відображення коментарів
[33m04dd219[m fix: виправлено currentUserName і залежності useEffect
[33mfffe77b[m fix: виправлено відображення автора коментаря у BlogPage
[33m198f5de[m people
[33m0e498bb[m fix: автор коментаря і дата з перевіркою на null
[33mcd96cd0[m fixanonymos
[33m1839414[m fix: не передаємо user_id вручну при створенні коментаря
[33m63e8690[m qwert
[33m34123b3[m fix: оновлено лог?ку
[33mc110136[m fix: оновлено логіку BlogPage, виправлено user_id у коментарях
[33m9b5e1bf[m fix: виправлено BlogPage.jsx для уникнення 401 без токена
[33m1a34a6e[m fix: передача user_id у коментарі для backend
[33me971363[m fix: додано
[33mb36abc1[m fix: додано user_id до коментаря для успішного створення
[33meb13726[m fix: виправлено додавання коментарів та логування у BlogPage
[33ma281d32[m fix: виведення
[33m804993d[m fix: виправлено додавання коментарів (заміна поля text на comment)
[33m4778d57[m fix: виведення імені автора коментаря через authorName
[33md848e02[m fix: виправлено BlogPage та очищено від помилок для білду
[33m6096e36[m fix: прибрано unused-змінні для успішного білду
[33m704f6dd[m fix: виправлено BlogPage та очищено від помилок для білду
[33m764e3b4[m fix: повернено fetchSubscriptions для успішного білду
[33m6e6bcf2[m debug: додано логування до BlogPage для діагностики 403 при коментарях
[33mdf83821[m fix: відображення authorName у коментарях BlogPage згідно з контролером
[33m4475588[m fix: додано авторизацію до коментарів, лайків і підписок
[33m6634b27[m fix: додано авторизацію при додаванні коментарів у BlogPage
[33m10af813[m fix: ensure
[33m95c2818[m fix: ensure blogs and ideas are loaded properly on BlogPage
[33mfabc9bd[m оновлення BlogPage з автором і типом
[33m574c450[m 🔄 Update BlogPage to support unified blog/idea entries with author info
[33mb4860b6[m 🔧 Fixed entry type filter and author display on BlogPage
[33m03c4e66[m 🔧 Update BlogPage: fetch comments with token and fix anonymous author display
[33m8a78923[m 🐛 Виправлено відображення авторів для блогів, ідей і проблем згідно нового контролера
[33m4ed8544[m ♻️ Оновлено API на актуальні Render-посилання, рефакторинг компонентів
[33m8113d6a[m ?? Оновлено MyProjectsPage: покращено в?дображення
[33m0619a40[m 🔧 Оновлено MyProjectsPage: покращено відображення коментарів та авторизацію
[33ma215ddb[m 64474007
[33m91f3d34[m 644747
[33m9309de9[m JOIN
[33m624bb2c[m ✅ Виправлено BlogPage: автори, токен, фільтри, сортування
[33m21d8c02[m Submit
[33maacff8c[m fixed by ptocrt this
[33m4d2cfd3[m 🚀 Delay + token check before ambassador fetch
[33mb03f8e4[m 🐢 Delay added before ambassador fetch to fix Render cold start
[33m13e0063[m ✅ Fix API URLs to backend-avtologistika for ideas and feedback
[33m85504b8[m ✅ Fix API endpoint base and path to resolve fetch errors
[33m6c32a02[m ♻️ Виправлено логіку подання ідеї: токен, API, амбасадори
[33m846cbe6[m ✅ Fix ESLint: перенесено tryFetchAmbassadors всередину useEffect
[33m9de6283[m 🔥 SubmitIdeaPage: форсована прокидка бекенду + стабільне завантаження амбасадорів
[33m11724f1[m 🚀 Додав _redirects для SPA маршрутизації
[33m673cefe[m 🐛 Fix: логування, пінг Render, запит амбасадорів і подання ідеї
[33m8e6ebf2[m 💡 SubmitIdeaPage: логування payload + правильні URL + userId з localStorage
[33ma6c7a31[m ✅ SubmitIdeaPage: виправлені API-шляхи на /api/ideaRoutes та ambassadors
[33m722c238[m 📦 SubmitIdeaPage: user_id тепер з localStorage, повернено /api, стабільне подання ідеї
[33m13807f2[m ✅ Виправлено SubmitIdeaPage: перевірка авторизації, логування профілю, обробка помилок
[33m484ce0b[m ♻️ Оновлено SubmitIdeaPage: виправлені fetch-запити, оновлені маршрути без /api
[33m852369a[m ♻️ Виправлено API-шляхи: прибрано /api, оновлено routes для ambassadors та problems
[33m3b89003[m ♻️ Виправлено завантаження амбасадорів у SubmitIdeaPage
[33mba811ab[m ♻️ Глобальні оновлення: логування, обробка токена, правильна адреса бекенду, виправлення SubmitIdeaPage
[33m9a36d56[m 🔥 push frontend
[33m8b20e46[m ♻️ Виправлення підвантаження амбасадорів та оновлення SubmitIdeaPage
[33m52b9a1f[m 🔧 Виправлено логін — правильна адреса бекенду та обробка JSON
[33m724dcc9[m ✅ Fix frontend: правильний API_URL для реєстрації
[33med1c7e1[m Register page: direct fetch without apiRequest helper
[33mf5d6d4e[m Fix registration page and apiRequest handling
[33mb692325[m Fix Netlify build error: remove unused errorText
[33md6edf6b[m Виправлення декодування юнікоду на сторінці реєстрації
[33mce71c36[m fix: правильний код реєстрації
[33mfdba2c6[m fix: правильний WorkerPage.js із нормальним відображенням даних користувача
[33m2bf0249[m fix: додано правильний UserContext для роботи контексту користувача
[33mda12884[m fix: правильні зміни Header і LoginPage
[33m11f618b[m fix: правильний редагований Header і LoginPage
[33m9f26003[m Fix: correct LoginPage.js file path (case sensitive)
[33m71bd178[m Додав setupProxy.js для проксі на бекенд
[33m10b2903[m fix: додано proxy до бекенду для локальної роботи без CORS
[33m3f67266[m 🚀 Fix Header rendering after token check (correct useNavigate)
[33m9d8556d[m 🔥 Correct App.js structure: BrowserRouter wrap
[33m21aacc1[m 🚀 Fix: wrap everything in BrowserRouter for correct navigation
[33m2880974[m 🔄 Full clean App.js + router context fix
[33m146c105[m Fix: повна чистка коду BlogPage.js для успішного білду
[33m5fc21ae[m fix: full cleanup and fixes for successful build
[33m1a0e833[m 🚀 Виправлені useCallback та залежності useEffect для Header, BlogPage, MyProjectsPage
[33m9337f57[m ♻️ Виправлено ESLint помилки: useEffect dependencies, useCallback для стабільності функцій
[33m7ab5085[m 🚀 Виправлення ESLint помилок, оновлення API на Render бекенд
[33m6adf675[m Оновив browserslist і додав babel plugin для чистоти білда
[33m7cccb99[m Оновив WorkerPage під Render + дрібні виправлення
[33m8910860[m ✅ Виправлено: додано бібліотеку antd для Netlify
[33ma27b9d4[m 🚑 Виправлено: додано react-router-dom для Netlify
[33m02705ad[m 🛠️ Виправлено: додано компонент HomePage
[33m5ab5185[m 🔥 Виправлено App.js — повернуто UI та логіку
[33m9a52b75[m 🚑 Виправлено помилку: додано axios
[33m01aa8ca[m 🎨 Додано UI та запити до бекенду
[33m9af6aab[m Initialize project using Create React App
