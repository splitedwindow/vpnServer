# Розроблення VPN-системи із забезпеченням конфіденційності та захисту мережевого трафіку користувачів

**Автор:** Мищишин Роман Андрійович

**Науковий керівник:** Орест Райтер, PhD

---

## Опис

Система реалізує корпоративний VPN на базі MikroTik L2TP/IPsec з централізованою RADIUS-аутентифікацією (FreeRADIUS + MySQL).

Компоненти: FreeRADIUS, MySQL, Express.js API, React-фронтенд, Electron VPN-клієнт.

---

## Встановлення та запуск

### Вимоги

- Docker Desktop
- Node.js 18+

### Серверна частина

```bash
docker-compose up -d
```

Після запуску доступно:
- API: `http://localhost:3000`
- Адмін-панель: `http://localhost:5173`
- phpMyAdmin: `http://localhost:8080` (radius / radiuspassword)

### Фронтенд (якщо не запущено через Docker)

```bash
cd frontend
npm install
npm run dev
```

### VPN-клієнт (Windows)

```bash
cd vpn-client
npm install
npm start
```

---

## Тестовий користувач

- Логін: `testuser`
- Пароль: `testpass`
