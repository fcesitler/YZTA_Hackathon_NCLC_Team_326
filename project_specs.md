# Project Specs — AI Delegation & Orchestration Engine

## Genel Bakış

Next.js 14 (App Router) tabanlı web dashboard. Çalışanlar kendi görevlerini görür, adminler tüm sistemi yönetir. Supabase Auth ile kimlik doğrulama, Supabase Realtime ile canlı güncellemeler.

---

## Sayfalar & Kullanıcı Akışları

| Sayfa | Yol | Açıklama | Erişim |
|-------|-----|----------|--------|
| Login | `/login` | Email/şifre ile giriş | Herkese açık |
| Dashboard | `/dashboard` | Kişisel görev listesi | Giriş yapmış çalışan |
| Admin | `/admin` | Tüm görevler + filtreler + grafikler | Admin |
| Ekip Yönetimi | `/admin/team` | Üye ekle/düzenle, departman yönetimi | Admin |
| AI Asistan | `/admin/assistant` | Claude MCP chat arayüzü | Admin |

### Auth Akışı
1. Kullanıcı herhangi bir sayfaya gider
2. Middleware oturumu kontrol eder
3. Oturum yoksa → `/login` yönlendirir
4. Login sonrası: Admin ise `/admin`, değilse `/dashboard`

---

## Supabase Tabloları

### `departments`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL
created_at  timestamptz DEFAULT now()
```

### `team_members`
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE
full_name      text NOT NULL
email          text NOT NULL UNIQUE
department_id  uuid REFERENCES departments(id)  -- NULL ise admin
created_at     timestamptz DEFAULT now()
```

### `tasks`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
title         text NOT NULL
summary       text
urgency       text CHECK (urgency IN ('low', 'medium', 'high', 'critical'))
status        text CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending'
assigned_to   uuid REFERENCES team_members(id)
department_id uuid REFERENCES departments(id)
deadline      timestamptz
reason        text        -- Atanma gerekçesi (AI veya manuel)
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

### RLS Politikaları

```sql
-- team_members: Herkes kendini görebilir
-- tasks: Çalışan sadece assigned_to=kendi kaydı olan görevleri görebilir
-- Admin (department_id IS NULL): Tüm görevleri görebilir/düzenleyebilir
-- RLS her zaman açık
```

---

## Component Yapısı

```
/components
  /ui/                     → shadcn/ui base (Button, Card, Badge, Input, Select, Dialog)
  /tasks/
    TaskCard.tsx           → Görev kartı: başlık, özet, urgency badge, deadline, department, reason
    TaskList.tsx           → Filtrelenebilir görev listesi, Supabase Realtime entegrasyonu
    TaskStatusButton.tsx   → "Devam Ediyor" / "Tamamlandı" durum butonu
  /admin/
    TeamWorkload.tsx       → Kişi başına açık görev sayısı özeti
    DepartmentChart.tsx    → Recharts bar chart — departman bazlı görev dağılımı
    AssignOverride.tsx     → Manuel atama/yeniden atama formu
  /layout/
    Sidebar.tsx            → Sol navigasyon (çalışan vs admin görünümü, rol bazlı linkler)
    Header.tsx             → Üst bar: kullanıcı adı + çıkış butonu
  /assistant/
    MCPChat.tsx            → Claude MCP doğal dil chat arayüzü
```

---

## API Route'ları

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/tasks` | Görevleri getir (çalışan: kendi, admin: hepsi + filtre) |
| PATCH | `/api/tasks` | Görev durumunu güncelle |
| POST | `/api/admin/assign` | Manuel görev atama/yeniden atama |
| GET | `/api/admin/members` | Ekip üyelerini listele |
| POST | `/api/admin/members` | Yeni üye ekle |
| PATCH | `/api/admin/members` | Üye bilgisi güncelle |

---

## Dosya Yapısı

```
/app
  /login/page.tsx
  /dashboard/page.tsx
  /dashboard/layout.tsx
  /admin/page.tsx
  /admin/layout.tsx
  /admin/team/page.tsx
  /admin/assistant/page.tsx
  /api/tasks/route.ts
  /api/admin/assign/route.ts
  /api/admin/members/route.ts
  layout.tsx
middleware.ts
/components/  (yukarıdaki yapı)
/lib/
  /supabase/
    client.ts   → createBrowserClient (client components)
    server.ts   → createServerClient (server components + API routes)
  utils.ts
/supabase/
  schema.sql
  seed.sql
.env.local
```

---

## Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLAUDE_MCP_ENDPOINT=
```

---

## Design Sistemi

- **Arkaplan:** `#0A0A0A`
- **Metin:** beyaz / `text-white`, `text-slate-400`
- **Vurgu:** elektrik mavisi `#3B82F6` (`blue-500`)
- **Görev Durumları:**
  - `pending` → sarı (`yellow-500`)
  - `in_progress` → mavi (`blue-500`)
  - `completed` → yeşil (`green-500`)
- Emoji ikon yok
- Generic gradient yok
- shadcn/ui dark theme + slate base

---

## "Tamamlandı" Kriterleri

- [ ] `npm run build` hatasız geçiyor
- [ ] Login sayfası çalışıyor (email/şifre)
- [ ] Giriş yapılmadan hiçbir sayfa açılmıyor
- [ ] Çalışan sadece kendi görevlerini görüyor (RLS)
- [ ] Durum güncelleme butonu çalışıyor
- [ ] Realtime güncelleme çalışıyor (iki sekme testi)
- [ ] Admin sayfası çalışanlara kapalı
- [ ] Departman bazlı bar chart render oluyor
- [ ] Claude MCP chat arayüzü açılıyor
