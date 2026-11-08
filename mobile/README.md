# Balıkçı Meram · Mobil

iOS ve Android için Expo SDK 58, Expo Router ve TypeScript uygulaması. Web sürümü depo kökünde yer alır.

## Telefonda çalıştırma

Bu klasörde Node.js 22.13 veya daha yeni bir sürümle:

```sh
npm ci
npx expo start --clear
```

Expo SDK 58 ile uyumlu Expo Go veya bir geliştirme derlemesiyle QR kodunu aç. Mağazadaki Expo Go sürümü SDK 58 ile uyumlu değilse, kendi geliştirme derlemeni kullan. iOS simülatörü için macOS ve Xcode gerekir. Android emülatörü için Android Studio gerekir.

```sh
npm run typecheck
npx expo install --check
npx expo export --platform all
```

## Yerel derleme

iOS varsayılan olarak Apple Haritalar'ı kullanır. Android'in bağımsız uygulamasında Google Maps SDK for Android'i etkinleştir. Anahtarı uygulama paket adı ve imza sertifikasının SHA-1 değeriyle sınırlandır. `GOOGLE_MAPS_ANDROID_API_KEY` değişkenini yerel `.env.local` dosyasında veya derleme ortamında tanımlayıp uygulamayı yeniden derle. Harita anahtarını Git'e ekleme.

## Kullanım

- **Harita** sekmesinde kıyıya dokun veya **Bulunduğum Yeri İşaretle (GPS)** düğmesini kullan. Bir iğne seçtiğinde o meradaki son avları görürsün.
- **+ Balık Kaydet** seçili merayı kullanır. Seçili mera yoksa konum seçmeni ister. Türü seçip **Balığı Kaydet** düğmesine basabilirsin. Varsayılan zaman **Şu An**. Sabah ve akşam seçenekleri en son gerçekleşen 06.00 ve 18.00 saatlerini kullanır.
- İstersen kamerayla fotoğraf çekebilir veya galeriden seçebilirsin.
- **Tutulan Balıklar** sekmesinde avları türe göre filtreleyebilirsin. Örnek avlar etiketlenir.

Uygulama 18 balık seçeneği, 12 örnek mera ve 18 örnek av ile başlar. Kayıtlar cihazdaki AsyncStorage alanında, fotoğraflar uygulamanın kalıcı dosya alanında tutulur. Uygulamanın silinmesi yerel kayıtları kaldırır.
