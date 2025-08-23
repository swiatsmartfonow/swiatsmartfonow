# Instrukcje wdrożenia aplikacji na Netlify

## Wymagania systemowe

### 1. Zainstaluj Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Zaloguj się do Netlify
```bash
netlify login
```

## Konfiguracja zmiennych środowiskowych

Przed wdrożeniem ustaw wszystkie wymagane zmienne środowiskowe:

```bash
# Baza danych Neon
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_Dneug0vq8QTK@ep-quiet-voice-aem7s602-pooler.c-2.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# AWS S3 Configuration
netlify env:set AWS_ACCESS_KEY_ID "AKIA4AC3X37BJBIIKSWK"
netlify env:set AWS_SECRET_ACCESS_KEY "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"
netlify env:set AWS_REGION "us-east-2"
netlify env:set AWS_S3_BUCKET_NAME "img-slider-swiatsmarfonow"

# Security
netlify env:set JWT_SECRET "test_2jwt_secret_key_for_development"

# CORS Configuration
netlify env:set ALLOWED_ORIGINS "http://localhost:8888,http://localhost:3000,http://localhost:3001,http://localhost:8000,https://swiat-smartfonow.netlify.app"
```

## Wdrożenie aplikacji

### 1. Połącz projekt z Netlify (jeśli nie jest połączony)
```bash
netlify link --id=3eeecc64-37dd-4852-a827-c0c0924a9b71
```

### 2. Wdróż na produkcję
```bash
netlify deploy --prod
```

### 3. Sprawdź status wdrożenia
```bash
netlify status
```

## Testowanie API

### Sprawdź endpoint images
```bash
curl -v https://swiat-smartfonow.netlify.app/api/images
```

### Sprawdź strony HTML
```bash
curl -I https://swiat-smartfonow.netlify.app/lista.html
```

## Monitorowanie

### Sprawdź logi funkcji
```bash
netlify logs:function
```

### Lista funkcji
```bash
netlify functions:list
```

## Dostępne endpointy

- **Lista obrazów**: https://swiat-smartfonow.netlify.app/lista.html
- **Dodawanie obrazów**: https://swiat-smartfonow.netlify.app/add.html
- **Usuwanie obrazów**: https://swiat-smartfonow.netlify.app/delete.html
- **API Images**: https://swiat-smartfonow.netlify.app/api/images
- **API Upload**: https://swiat-smartfonow.netlify.app/api/upload

## Rozwiązywanie problemów

### Błąd połączenia z bazą danych
- Sprawdź czy zmienna `DATABASE_URL` jest ustawiona
- Zweryfikuj połączenie z bazą Neon

### Błąd AWS S3
- Sprawdź zmienne AWS (ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION, BUCKET_NAME)
- Zweryfikuj uprawnienia bucketu S3

### Błąd CORS
- Sprawdź zmienną `ALLOWED_ORIGINS`
- Dodaj nowe domeny jeśli potrzebne

## Struktura projektu

```
img-app/
├── functions/
│   ├── images.js      # API do zarządzania obrazami
│   └── upload.js      # API do przesyłania plików
├── netlify.toml       # Konfiguracja Netlify
├── lista.html         # Strona listy obrazów
├── add.html          # Strona dodawania obrazów
├── delete.html       # Strona usuwania obrazów
└── .env              # Zmienne środowiskowe (lokalnie)
```

## Uwagi bezpieczeństwa

- Nigdy nie commituj pliku `.env` do repozytorium
- Używaj zmiennych środowiskowych Netlify dla danych wrażliwych
- Regularnie rotuj klucze AWS i JWT_SECRET
- Monitoruj logi pod kątem podejrzanej aktywności