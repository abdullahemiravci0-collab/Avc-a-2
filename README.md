# AVCI AI 🚀

AVCI AI, Google'ın güncel **Gemini** modelleri ile güçlendirilmiş, Türkçe ve çok dilli akıllı bir yapay zeka asistanı ve yaratıcı üretim platformudur.

---

## 🌟 Öne Çıkan Özellikler

- **Çoklu Model Desteği**: `gemini-2.5-flash`, `gemini-2.5-pro` ve `gemini-2.0-flash` ile yüksek hızlı ve derinlemesine akıl yürütme.
- **5 Farklı Uzman Personası**:
  - ⚡ **Genel Asistan**: Kapsamlı, net ve çözüm odaklı günlük yardımcı.
  - 💻 **Yazılım Mimarı**: Temiz kod (Clean Code), algoritmalar, hata ayıklama ve mimari önerileri.
  - ✍️ **Yaratıcı Yazar**: Etkileyici metinler, makaleler, hikayeler ve pazarlama içerikleri.
  - 📊 **Strateji & Analist**: SWOT analizleri, veri mantığı, pazar stratejileri ve eylem planları.
  - 🌐 **Dilbilimci & Çevirmen**: Kültürel bağlamı koruyan doğal ve profesyonel çeviriler.
- **Canlı Web Araması (Google Search Grounding)**: En güncel internet bilgilerine erişim ve kaynak referansları.
- **Sesli Yanıt (TTS - Text-to-Speech)**: Türkçe ve uluslararası ses seçenekleriyle asistan yanıtlarını sesli dinleme.
- **Sesle Yazma (Speech-to-Text)**: Mikrofon üzerinden sesinizi yazıya dönüştürerek hızlı mesajlaşma.
- **Çok Modlu Girdi (Multimodal)**: Görsel yükleme, analiz etme ve fotoğraflar üzerinden soru sorma.
- **Kişiselleştirilmiş API Anahtarı Yönetimi**: Hem sunucu ortam değişkeni hem de kullanıcı arayüzü üzerinden anında test edilebilir özel Gemini API anahtarı desteği.
- **Sohbet Yönetimi**: Sohbet geçmişi kaydetme, düzenleme, arama ve Markdown/JSON formatlarında dışa aktarma.

---

## 🛠️ Teknoloji Yığını

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion, Lucide Icons, React Markdown
- **Backend / Sunucu**: Node.js, Express (CJS Bundle via esbuild)
- **Yapay Zeka**: `@google/genai` (Google Gen AI TypeScript SDK)
- **Geliştirme & Paketleme**: Vite, TSX

---

## ⚙️ Kurulum ve Başlangıç

### 1. Gereksinimler
- **Node.js**: v18.0 veya üzeri
- **npm** ya da **yarn** / **pnpm**
- **Google Gemini API Anahtarı**: [Google AI Studio](https://aistudio.google.com/app/apikey) adresinden ücretsiz temin edebilirsiniz.

### 2. Depoyu İndirin ve Bağımlılıkları Yükleyin

```bash
# Bağımlılıkları yükleyin
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

Proje kök dizininde bir `.env` dosyası oluşturun (`.env.example` dosyasını kopyalayabilirsiniz):

```env
GEMINI_API_KEY=AIzaSy...SizinGeminiApiAnahtariniz
```

*(Not: Dilerseniz API anahtarınızı uygulamayı açtıktan sonra arayüzdeki **"API Key Yaz"** butonundan doğrudan tarayıcınıza da kaydedebilirsiniz).*

### 4. Uygulamayı Başlatın

```bash
# Geliştirme modu (Geliştirici sunucusu)
npm run dev
```

Uygulama varsayılan olarak **http://localhost:3000** adresinde açılacaktır.

---

## 📦 Üretim Derlemesi (Production Build)

```bash
# Uygulamayı ve Express sunucusunu tek bir pakette derleyin
npm run build

# Üretim sunucusunu başlatın
npm start
```

---

## 🔑 Gemini API Anahtarı Nasıl Alınır?

1. [Google AI Studio](https://aistudio.google.com/app/apikey) sayfasına gidin.
2. Google hesabınızla giriş yapın.
3. **"Create API Key"** butonuna tıklayın.
4. Oluşturulan anahtarı kopyalayın.
5. AVCI AI arayüzünde üst bardaki **"API Key Yaz"** veya mesaj kutusu üzerindeki uyarıya tıklayıp yapıştırın ve **"Doğrula & Test Et"** diyerek kaydedin.

---

## 📄 Lisans

Bu proje kişisel ve kurumsal kullanım için hazırlanmıştır.
