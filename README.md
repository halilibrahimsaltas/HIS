# LIMS - Laboratuvar Bilgi Yönetim Sistemi

Laboratuvar Bilgi Yönetim Sistemi (LIMS) projesi.

## Teknolojiler

### Backend
- NestJS + TypeScript
- PostgreSQL + Prisma
- JWT Authentication
- Role-Based Access Control (RBAC)

### Frontend
- React + Vite
- Material UI
- React Router
- Axios

## Kurulum

### Backend

1. Backend klasörüne gidin:
```powershell
cd backend
```

2. Bağımlılıkları yükleyin:
```powershell
npm install
```

3. PostgreSQL veritabanını oluşturun ve `.env` dosyasını düzenleyin:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/lims"
JWT_SECRET="supersecretkey"
```

4. Prisma migration çalıştırın:
```powershell
npx prisma migrate dev --name init
```

5. Seed verilerini yükleyin:
```powershell
npm run prisma:seed
```

6. Backend'i başlatın:
```powershell
npm run start:dev
```

Backend `http://localhost:3000` adresinde çalışacaktır.

### Frontend

1. Frontend klasörüne gidin:
```powershell
cd frontend
```

2. Bağımlılıkları yükleyin:
```powershell
npm install
```

3. Frontend'i başlatın:
```powershell
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

## Varsayılan Kullanıcılar

- **Admin**: admin@lims.com / admin123
- **Resepsiyon**: reception@lims.com / reception123

## Özellikler

### Resepsiyon
- Hasta kayıt oluşturma
- Test seçimi
- Fiyatlandırma

### Admin
- Test içerik yönetimi (test ekleme, fiyat belirleme)
- Hasta yönetimi
- Test istem yönetimi

## Roller

- **ADMIN**: Tüm işlemlere erişim
- **RECEPTION**: Hasta ve test istem yönetimi
- **LAB**: Laborant (ileride eklenecek)

