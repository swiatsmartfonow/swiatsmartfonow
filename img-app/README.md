# Świat Smartfonów - Panel Zarządzania Zdjęciami (Netlify)

Aplikacja serverless do zarządzania zdjęciami zbudowana dla platformy Netlify.

## Funkcjonalności

- ✅ Przesyłanie zdjęć z automatyczną kompresją
- ✅ Przeglądanie galerii zdjęć
- ✅ Usuwanie wybranych zdjęć
- ✅ Responsywny design
- ✅ Integracja z AWS S3
- ✅ Baza danych PostgreSQL (Neon)

## Struktura projektu

```
netlify-app/
├── functions/          # Netlify Functions
│   ├── images.js       # API do zarządzania zdjęciami
│   └── upload.js       # API do przesyłania plików
├── add.html           # Strona dodawania zdjęć
├── lista.html         # Galeria zdjęć
├── delete.html        # Strona usuwania zdjęć
├── netlify.toml       # Konfiguracja Netlify
├── _redirects         # Przekierowania
├── package.json       # Zależności Node.js
└── .env.example       # Przykład zmiennych środowiskowych
```

## API Endpoints

### 1. Zarządzanie obrazami - `/api/images`

**GET** `/api/images` - Pobierz listę wszystkich obrazów
- Zwraca: Array obiektów z informacjami o obrazach
- Przykład odpowiedzi:
```json
[
  {
    "id": 1,
    "author": "Anonymous",
    "urls": {
      "small": "https://bucket.s3.amazonaws.com/small-12345-image.png",
      "medium": "https://bucket.s3.amazonaws.com/medium-12345-image.png",
      "original": "https://bucket.s3.amazonaws.com/original-12345-image.png"
    },
    "width": 5000,
    "height": 3333,
    "created_at": "2025-08-23T04:00:00Z"
  }
]
```

**POST** `/api/images` - Dodaj nowy obraz (metadane)
- Body: JSON z danymi obrazu
- Zwraca: Utworzony obiekt obrazu

**PUT** `/api/images` - Aktualizuj istniejący obraz
- Body: JSON z ID i nowymi danymi
- Zwraca: Zaktualizowany obiekt obrazu

**DELETE** `/api/images` - Usuń obraz
- Body: JSON z ID obrazu do usunięcia
- Zwraca: Status operacji

### 2. Upload plików - `/api/upload`

**POST** `/api/upload` - Prześlij plik obrazu
- Content-Type: `multipart/form-data`
- Fields: `file` (plik obrazu), `author` (opcjonalne)
- Automatyczna kompresja do 3 rozmiarów: small, medium, original
- Zwraca: Obiekt z URL-ami do przesłanego obrazu

### Struktura URL-i obrazów

Każdy obraz jest dostępny w trzech rozmiarach:
- **small**: 400px szerokości (do miniatur)
- **medium**: 800px szerokości (do galerii)
- **original**: Oryginalny rozmiar (do pełnego widoku)

Format URL: `https://[BUCKET].s3.amazonaws.com/[SIZE]-[UUID]-[FILENAME]`

## Wymagania

- Konto Netlify
- Baza danych PostgreSQL (zalecane: Neon)
- Bucket AWS S3
- Node.js 18+

## Instalacja i wdrożenie

### 1. Przygotowanie bazy danych

Utwórz tabelę w bazie PostgreSQL:

```sql
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    author TEXT NOT NULL,
    urls JSONB NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Konfiguracja AWS S3

1. Utwórz bucket S3
2. Skonfiguruj CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

3. Ustaw bucket policy dla publicznego dostępu do odczytu

### 3. Wdrożenie na Netlify

#### Opcja A: Przez Netlify CLI

```bash
# Zainstaluj Netlify CLI
npm install -g netlify-cli

# Zaloguj się do Netlify
netlify login

# Wdróż aplikację
netlify deploy --prod
```

#### Opcja B: Przez Git

1. Wypchnij kod do repozytorium Git
2. Połącz repozytorium z Netlify
3. Ustaw zmienne środowiskowe w panelu Netlify

### 4. Konfiguracja zmiennych środowiskowych

W panelu Netlify (Site settings > Environment variables) ustaw:

```
DATABASE_URL=postgresql://username:password@hostname:5432/database
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
NODE_ENV=production
UPLOAD_MAX_SIZE=10485760
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=https://yourdomain.netlify.app
```

### 5. Instalacja zależności

```bash
npm install
```

## Rozwój lokalny

```bash
# Uruchom serwer deweloperski Netlify
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:8888`

## API Endpoints

### GET /.netlify/functions/images
Pobiera listę wszystkich zdjęć

### POST /.netlify/functions/images
Tworzy nowy rekord zdjęcia

### PUT /.netlify/functions/images?id={id}
Aktualizuje dane zdjęcia

### DELETE /.netlify/functions/images?id={id}
Usuwa zdjęcie

### POST /.netlify/functions/upload
Przesyła pliki zdjęć

## Bezpieczeństwo

- CORS skonfigurowany dla bezpiecznych źródeł
- Walidacja typów plików
- Ograniczenia rozmiaru plików
- Bezpieczne nagłówki HTTP
- Szyfrowane połączenie z bazą danych

## Wsparcie

W przypadku problemów sprawdź:
1. Logi funkcji w panelu Netlify
2. Konfigurację zmiennych środowiskowych
3. Uprawnienia AWS S3
4. Połączenie z bazą danych

## Licencja

MIT License