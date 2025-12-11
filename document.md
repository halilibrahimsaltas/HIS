Elbette! Sana Cursor Agent’ın anlayabileceği şekilde, LIMS (Laboratuvar Bilgi Yönetim Sistemi) geliştirmek için kullanılacak tam kapsamlı bir teknik dokümantasyon hazırlayacağım.
Bu dokümantasyon, Cursor’a verdiğinde doğrudan projeyi kurmaya, dosyaları oluşturmaya ve sistemi geliştirmeye başlayabilir.

Aşağıda TEMİZ, ADIM ADIM, KOD ODAKLI, MİMARİ NET bir dökümantasyon bulacaksın.

📘 LIMS — Teknik Dokümantasyon (Cursor Agent İçin)

Proje: Laboratuvar Bilgi Yönetim Sistemi
Backend: Node.js (NestJS + TypeScript)
Frontend: React + Vite + Material UI
Database: PostgreSQL + Prisma
Kimlik Yönetimi: JWT + RBAC
Amaç:
İlk sürümde şu özellikler yapılacak:

Resepsiyon:

Hasta kayıt oluşturma

Test seçimi

Fiyatlandırma

Admin:

Test içerik yönetimi (test ekleme, fiyat belirleme)

Roller:

Admin

Resepsiyon

Laborant (şimdilik boş)

Mimarinin ileride cihaz entegrasyonuna (Cobas, Sysmex vb.) uygun olması

📂 1. Proje Klasör Yapısı

Cursor agent'a birebir şu klasör yapısını oluşturmasını söyleyebilirsin:

lims-project/
 ├── backend/
 │    ├── src/
 │    │    ├── modules/
 │    │    │    ├── auth/
 │    │    │    ├── users/
 │    │    │    ├── patients/
 │    │    │    ├── tests/
 │    │    │    └── orders/
 │    │    ├── common/
 │    │    ├── config/
 │    │    └── main.ts
 │    ├── prisma/
 │    │    └── schema.prisma
 │    ├── package.json
 │    └── tsconfig.json
 │
 ├── frontend/
 │    ├── src/
 │    │    ├── components/
 │    │    ├── pages/
 │    │    ├── hooks/
 │    │    ├── context/
 │    │    └── App.jsx
 │    ├── index.html
 │    └── package.json
 │
 └── README.md

⚙️ 2. Backend Kurulum Talimatı

Cursor'a şu işlemleri yaptır:

NestJS projesi oluştur
npm i -g @nestjs/cli
nest new backend

Prisma kurulumu
cd backend
npm install prisma --save-dev
npm install @prisma/client
npx prisma init

PostgreSQL bağlantısı (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/lims"
JWT_SECRET="supersecretkey"

🗄️ 3. Veritabanı Tasarımı (Prisma Şeması)

Cursor’a prisma/schema.prisma dosyasını şöyle yazdır:

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

🔐 4. Auth Modülü (JWT)

Cursor Agent’a şu yapıyı oluşturmasını söyle:

backend/src/modules/auth/
   - auth.controller.ts
   - auth.service.ts
   - auth.module.ts
   - jwt.strategy.ts

Gerekli paketler
npm install @nestjs/jwt bcrypt

Örnek JWT Strategy
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

👤 5. Kullanıcı (Admin / Resepsiyon / Lab) Modülü

Cursor’a admin için seed user eklet:

npx prisma db seed


Seed dosyası:

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123",10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@lims.com",
      password,
      role: "ADMIN",
    }
  });
}

main();

🧪 6. Test Yönetimi Modülü

CRUD işlemleri:

Test ekle

Test listesi

Test güncelle

Test sil

Cursor’a controller/service dosyaları oluşturmasını söyle.

👨‍⚕️ 7. Hasta Modülü

API uçları:

Method	Endpoint	Açıklama
POST	/patients	Hasta oluştur
GET	/patients	Hasta listesi
GET	/patients/:id	Hasta detay
PUT	/patients/:id	Güncelle
DELETE	/patients/:id	Sil
🧾 8. Order (Test İstem) Modülü

Hasta için test seçip fiyatlandırma:

Method	Endpoint	Amaç
POST	/orders	Test istemi oluştur
GET	/orders/patient/:patientId	Bir hastanın tüm istemleri
GET	/orders/:id	Detay

Cursor agent’a OrderService içinde:

test IDs array

total = sum(test.price)

hesaplama eklemesini söyle.

🎨 9. Frontend React Yapısı
frontend/
  src/
    pages/
      Login.jsx
      Dashboard.jsx
      Patients.jsx
      Orders.jsx
      Tests.jsx
    components/
      PatientForm.jsx
      TestSelector.jsx
      PriceSummary.jsx
    context/AuthContext.jsx
    api/axios.js

Temel teknoloji:
npm create vite@latest
npm install @mui/material axios react-router-dom

🔗 10. Backend – Frontend Entegrasyonu

React tarafında:

axios.defaults.baseURL = "http://localhost:3000/api";


Login → JWT → localStorage → header:

axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

🚀 11. Geliştirme Yol Haritası
Aşama 1 – Temel Sistem (2–3 hafta)

Rol bazlı login

Hasta kayıt

Test listesi + yönetimi

Test istem (Order)

Fiyatlandırma

Dashboard

Aşama 2 – Laborant (İleride)

Numune kabul

Barkod

Sonuç ekranı

Aşama 3 – Cihaz Entegrasyonu

ASTM

HL7

Serialport

Queue mantığı