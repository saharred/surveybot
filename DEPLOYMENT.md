# 🚀 دليل نشر المشروع (Deployment Guide)

دليل شامل لنشر محلل الاستبيانات التعليمية على خوادم سحابية مختلفة.

---

## 📋 المتطلبات الأساسية قبل النشر

### 1. متغيرات البيئة (Environment Variables)

يجب توفير المتغيرات التالية:

```bash
# قاعدة البيانات
DATABASE_URL=mysql://user:password@host:3306/database

# المصادقة
JWT_SECRET=your-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-app-id

# الذكاء الاصطناعي (Manus APIs)
BUILT_IN_FORGE_API_KEY=your-api-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im

# معلومات المالك
OWNER_OPEN_ID=your-open-id
OWNER_NAME=your-name

# التحليلات (اختياري)
VITE_ANALYTICS_ENDPOINT=your-analytics-url
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# التطبيق
VITE_APP_TITLE=محلل الاستبيانات
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

### 2. قاعدة البيانات

- **MySQL 8.0+** أو **TiDB Cloud** (موصى به)
- يجب تشغيل `pnpm db:push` قبل النشر

### 3. التخزين السحابي

- **AWS S3** أو متوافق (للصور والملفات)
- يتم التكوين تلقائياً عبر Manus APIs

---

## ☁️ الخيار 1: Azure (موصى به للمدارس القطرية)

### لماذا Azure؟
- مراكز بيانات في الشرق الأوسط
- دعم ممتاز للمؤسسات التعليمية
- أسعار تنافسية

### الخطوات:

#### 1. إنشاء Azure App Service

```bash
# تسجيل الدخول إلى Azure
az login

# إنشاء Resource Group
az group create --name surveybot-rg --location uaenorth

# إنشاء App Service Plan
az appservice plan create \
  --name surveybot-plan \
  --resource-group surveybot-rg \
  --sku B1 \
  --is-linux

# إنشاء Web App
az webapp create \
  --name surveybot-app \
  --resource-group surveybot-rg \
  --plan surveybot-plan \
  --runtime "NODE:22-lts"
```

#### 2. إعداد قاعدة البيانات (Azure Database for MySQL)

```bash
# إنشاء MySQL Server
az mysql flexible-server create \
  --name surveybot-db \
  --resource-group surveybot-rg \
  --location uaenorth \
  --admin-user adminuser \
  --admin-password 'YourStrongPassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 8.0.21

# إنشاء قاعدة البيانات
az mysql flexible-server db create \
  --resource-group surveybot-rg \
  --server-name surveybot-db \
  --database-name surveybot
```

#### 3. تكوين متغيرات البيئة

```bash
# إضافة متغيرات البيئة
az webapp config appsettings set \
  --name surveybot-app \
  --resource-group surveybot-rg \
  --settings \
    DATABASE_URL="mysql://adminuser:YourStrongPassword123!@surveybot-db.mysql.database.azure.com:3306/surveybot?ssl=true" \
    JWT_SECRET="your-secret-key" \
    NODE_ENV="production"
```

#### 4. النشر من GitHub

```bash
# ربط GitHub
az webapp deployment source config \
  --name surveybot-app \
  --resource-group surveybot-rg \
  --repo-url https://github.com/saharred/surveybot \
  --branch main \
  --manual-integration
```

#### 5. تكوين Build

إنشاء ملف `.azure/config`:

```yaml
version: 1
build:
  commands:
    - pnpm install
    - pnpm build
    - pnpm db:push
  outputPath: dist
runtime:
  command: node dist/index.js
  port: 8080
```

### التكلفة المتوقعة (Azure):
- **App Service (B1)**: ~$13/شهر
- **MySQL (Burstable)**: ~$15/شهر
- **الإجمالي**: ~$28/شهر

---

## ☁️ الخيار 2: AWS (الأكثر مرونة)

### الخطوات:

#### 1. إنشاء EC2 Instance

```bash
# إنشاء EC2 Instance (t3.small)
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name your-key \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=surveybot}]'
```

#### 2. الاتصال بالخادم وتثبيت المتطلبات

```bash
# الاتصال بالخادم
ssh -i your-key.pem ubuntu@your-ec2-ip

# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت pnpm
sudo npm install -g pnpm

# تثبيت PM2 (لإدارة العمليات)
sudo npm install -g pm2
```

#### 3. استنساخ المشروع

```bash
# استنساخ من GitHub
git clone https://github.com/saharred/surveybot.git
cd surveybot

# تثبيت الحزم
pnpm install

# بناء المشروع
pnpm build
```

#### 4. إعداد قاعدة البيانات (RDS MySQL)

```bash
# إنشاء RDS MySQL
aws rds create-db-instance \
  --db-instance-identifier surveybot-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password YourPassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name surveybot
```

#### 5. تكوين متغيرات البيئة

```bash
# إنشاء ملف .env
cat > .env << EOF
DATABASE_URL=mysql://admin:YourPassword123!@surveybot-db.xxxxx.rds.amazonaws.com:3306/surveybot
JWT_SECRET=your-secret-key
NODE_ENV=production
# ... باقي المتغيرات
EOF

# تشغيل migrations
pnpm db:push
```

#### 6. تشغيل التطبيق مع PM2

```bash
# إنشاء ملف ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'surveybot',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# تشغيل التطبيق
pm2 start ecosystem.config.js

# حفظ التكوين
pm2 save

# تشغيل تلقائي عند إعادة التشغيل
pm2 startup
```

#### 7. إعداد Nginx (Reverse Proxy)

```bash
# تثبيت Nginx
sudo apt install -y nginx

# تكوين Nginx
sudo cat > /etc/nginx/sites-available/surveybot << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# تفعيل التكوين
sudo ln -s /etc/nginx/sites-available/surveybot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. إعداد SSL (Let's Encrypt)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com
```

### التكلفة المتوقعة (AWS):
- **EC2 (t3.small)**: ~$15/شهر
- **RDS (db.t3.micro)**: ~$15/شهر
- **الإجمالي**: ~$30/شهر

---

## ☁️ الخيار 3: Railway (الأسهل والأسرع)

### لماذا Railway؟
- **نشر بنقرة واحدة**
- **قاعدة بيانات مدمجة**
- **مجاني للبداية** ($5 رصيد شهري)

### الخطوات:

#### 1. إنشاء حساب على Railway

زيارة: https://railway.app

#### 2. ربط GitHub

- اختر "New Project"
- اختر "Deploy from GitHub repo"
- اختر `saharred/surveybot`

#### 3. إضافة قاعدة بيانات

- اضغط "New" → "Database" → "MySQL"
- Railway سيوفر `DATABASE_URL` تلقائياً

#### 4. إضافة متغيرات البيئة

في لوحة التحكم، أضف:
- `JWT_SECRET`
- `BUILT_IN_FORGE_API_KEY`
- وباقي المتغيرات

#### 5. النشر

- Railway سينشر تلقائياً!
- ستحصل على رابط مثل: `https://surveybot-production.up.railway.app`

### التكلفة المتوقعة (Railway):
- **مجاني** حتى $5/شهر
- بعدها: ~$10-20/شهر حسب الاستخدام

---

## ☁️ الخيار 4: Vercel + PlanetScale (للمشاريع الصغيرة)

### الخطوات:

#### 1. نشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
cd survey-analyzer-bot
vercel --prod
```

#### 2. إنشاء قاعدة بيانات على PlanetScale

```bash
# إنشاء حساب على https://planetscale.com
# إنشاء database جديد
# الحصول على DATABASE_URL
```

#### 3. إضافة متغيرات البيئة في Vercel

في لوحة تحكم Vercel:
- Settings → Environment Variables
- أضف جميع المتغيرات

### التكلفة:
- **Vercel**: مجاني للمشاريع الشخصية
- **PlanetScale**: مجاني حتى 1GB

---

## 🔧 ملاحظات مهمة للنشر

### 1. الأمان

```bash
# استخدم كلمات مرور قوية
# فعّل SSL/HTTPS دائماً
# استخدم متغيرات بيئة آمنة
# لا ترفع ملف .env إلى GitHub
```

### 2. الأداء

```bash
# استخدم CDN للملفات الثابتة
# فعّل Gzip compression
# استخدم Redis للـ caching (اختياري)
```

### 3. المراقبة

```bash
# استخدم PM2 للمراقبة
pm2 monit

# أو استخدم خدمات مثل:
# - New Relic
# - DataDog
# - Sentry (للأخطاء)
```

### 4. النسخ الاحتياطي

```bash
# نسخ احتياطي لقاعدة البيانات يومياً
# استخدم AWS S3 أو Azure Blob Storage
```

---

## 📊 مقارنة الخيارات

| الميزة | Azure | AWS | Railway | Vercel |
|--------|-------|-----|---------|--------|
| **السهولة** | متوسط | صعب | سهل جداً | سهل |
| **التكلفة** | $28/شهر | $30/شهر | $10-20/شهر | مجاني-$20 |
| **المرونة** | عالية | عالية جداً | متوسطة | منخفضة |
| **الدعم العربي** | ممتاز | جيد | محدود | محدود |
| **مراكز البيانات** | الإمارات | البحرين | أوروبا | عالمي |
| **للمدارس القطرية** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## 🎯 التوصية النهائية

### للمدارس القطرية:
**استخدم Azure** - أقرب مركز بيانات، دعم ممتاز، أسعار تعليمية

### للتجربة السريعة:
**استخدم Railway** - نشر بدقائق، مجاني للبداية

### للمشاريع الكبيرة:
**استخدم AWS** - أقصى مرونة وتحكم

---

## 📞 الدعم

للمساعدة في النشر، افتح Issue على GitHub:
https://github.com/saharred/surveybot/issues
