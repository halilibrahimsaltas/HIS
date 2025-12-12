# LIMS — Teknik Dokümantasyon

Bu dokümantasyon, Cursor Agent'ın anlayabileceği şekilde, LIMS (Laboratuvar Bilgi Yönetim Sistemi) geliştirmek için kullanılacak tam kapsamlı bir teknik dokümantasyondur. Cursor'a verdiğinizde doğrudan projeyi kurmaya, dosyaları oluşturmaya ve sistemi geliştirmeye başlayabilir.

## Proje Bilgileri

- **Proje Adı**: Laboratuvar Bilgi Yönetim Sistemi (LIMS)
- **Backend**: Node.js (NestJS + TypeScript)
- **Frontend**: React + Vite + Material UI
- **Database**: PostgreSQL + Prisma
- **Kimlik Yönetimi**: JWT + RBAC

## Amaç

İlk sürümde şu özellikler yapılacak:

### Resepsiyon
- Hasta kayıt oluşturma
- Test seçimi
- Fiyatlandırma

### Admin
- Test içerik yönetimi (test ekleme, fiyat belirleme)

### Roller
- **ADMIN**: Tüm işlemlere erişim
- **RECEPTION**: Hasta ve test istem yönetimi
- **LAB**: Laborant (şimdilik boş)

**Not**: Mimarinin ileride cihaz entegrasyonuna (Cobas, Sysmex vb.) uygun olması gerekmektedir.

---

## 1. Proje Klasör Yapısı

```
lims-project/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── patients/
│   │   │   ├── tests/
│   │   │   └── orders/
│   │   ├── common/
│   │   ├── config/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 2. Backend Kurulum Talimatı

### NestJS Projesi Oluşturma

```powershell
npm i -g @nestjs/cli
nest new backend
```

### Prisma Kurulumu

```powershell
cd backend
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

### PostgreSQL Bağlantısı (.env)

`.env` dosyasına şu değerleri ekleyin:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lims"
JWT_SECRET="supersecretkey"
```

---

## 3. Veritabanı Tasarımı (Prisma Şeması)

`prisma/schema.prisma` dosyası:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  role      Role
}

model Patient {
  id        Int       @id @default(autoincrement())
  firstName String
  lastName  String
  phone     String?
  createdAt DateTime  @default(now())
  orders    Order[]
}

model Test {
  id          Int       @id @default(autoincrement())
  code        String    @unique
  name        String
  price       Float
  sampleType  String
}

model Order {
  id        Int        @id @default(autoincrement())
  patientId Int
  tests     OrderTest[]
  total     Float
  createdAt DateTime   @default(now())

  patient   Patient    @relation(fields: [patientId], references: [id])
}

model OrderTest {
  id       Int    @id @default(autoincrement())
  orderId  Int
  testId   Int
  order    Order  @relation(fields: [orderId], references: [id])
  test     Test   @relation(fields: [testId], references: [id])
}

enum Role {
  ADMIN
  RECEPTION
  LAB
}
```

---

## 4. Auth Modülü (JWT)

### Dosya Yapısı

```
backend/src/modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
└── jwt.strategy.ts
```

### Gerekli Paketler

```powershell
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

### Örnek JWT Strategy

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
```

---

## 5. Kullanıcı (Admin / Resepsiyon / Lab) Modülü

### Seed Dosyası

`prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@lims.com',
      password,
      role: 'ADMIN',
    },
  });

  const receptionPassword = await bcrypt.hash('reception123', 10);
  await prisma.user.create({
    data: {
      name: 'Resepsiyon',
      email: 'reception@lims.com',
      password: receptionPassword,
      role: 'RECEPTION',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Seed Çalıştırma

`package.json`'a seed script ekleyin:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Sonra çalıştırın:

```powershell
npx prisma db seed
```

---

## 6. Test Yönetimi Modülü

### CRUD İşlemleri

- ✅ Test ekle
- ✅ Test listesi
- ✅ Test güncelle
- ✅ Test sil

Cursor'a controller/service dosyaları oluşturmasını söyleyin.

---

## 7. Hasta Modülü

### API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/patients` | Hasta oluştur |
| GET | `/patients` | Hasta listesi |
| GET | `/patients/:id` | Hasta detay |
| PUT | `/patients/:id` | Güncelle |
| DELETE | `/patients/:id` | Sil |

---

## 8. Order (Test İstem) Modülü

Hasta için test seçip fiyatlandırma işlemleri.

### API Endpoints

| Method | Endpoint | Amaç |
|--------|----------|------|
| POST | `/orders` | Test istemi oluştur |
| GET | `/orders/patient/:patientId` | Bir hastanın tüm istemleri |
| GET | `/orders/:id` | Detay |

### OrderService İçinde Hesaplama

Cursor agent'a `OrderService` içinde şu hesaplamayı eklemesini söyleyin:

- Test IDs array alınır
- `total = sum(test.price)` hesaplanır

---

## 9. Frontend React Yapısı

### Klasör Yapısı

```
frontend/
└── src/
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── Patients.jsx
    │   ├── Orders.jsx
    │   └── Tests.jsx
    ├── components/
    │   ├── PatientForm.jsx
    │   ├── TestSelector.jsx
    │   └── PriceSummary.jsx
    ├── context/
    │   └── AuthContext.jsx
    └── api/
        └── axios.js
```

### Temel Teknoloji Kurulumu

```powershell
npm create vite@latest frontend -- --template react
cd frontend
npm install @mui/material @emotion/react @emotion/styled axios react-router-dom
```

---

## 10. Backend – Frontend Entegrasyonu

### Axios Yapılandırması

`src/api/axios.js`:

```javascript
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api';

// Login → JWT → localStorage → header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
```

---

## 11. Geliştirme Yol Haritası

### Aşama 1 – Temel Sistem (2–3 hafta)

- ✅ Rol bazlı login
- ✅ Hasta kayıt
- ✅ Test listesi + yönetimi
- ✅ Test istem (Order)
- ✅ Fiyatlandırma
- ✅ Dashboard

### Aşama 2 – Laborant (İleride)

- ✅ Numune kabul
- ✅ Barkod
- ✅ Sonuç ekranı

### Aşama 3 – Cihaz Entegrasyonu

- 🔄 ASTM
- 🔄 HL7
- 🔄 Serialport
- 🔄 Queue mantığı

---


