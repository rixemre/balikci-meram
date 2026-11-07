# Balıkçı Meram

Kıyı balıkçıları için Türkçe mera haritası ve kişisel av günlüğü. Uygulama React, Tailwind CSS, Lucide ve React Leaflet ile hazırlanmıştır.

## Başlatma

Node.js 22.12 veya daha yeni bir sürüm gerekir. Bu klasörde çalıştır:

```sh
npm ci
npm run dev
```

Terminalde görünen yerel adresi aç. Üretim dosyaları için `npm run build` komutunu kullan. `npm run preview` bu dosyaları yerelde sunar.

## Kullanım

- **Harita** sekmesinde bir iğne seçerek o meradaki son avları gör. Yeni bir mera eklemek için haritaya dokun veya GPS düğmesini kullan.
- **Balık Ekle** düğmesi seçili merayı kullanır. **Değiştir** ile başka bir iğne seçebilir, haritadan yeni bir konum belirleyebilir veya GPS kullanabilirsin.
- Türü seç ve **Balığı kaydet** düğmesine bas. Varsayılan zaman kayıt anıdır. Sabah ve akşam seçenekleri en son gerçekleşen 06.00 ve 18.00 saatlerini kullanır.
- **Tutulan Balıklar** sekmesinde avları türlerine göre filtrele.

İstanbul, İzmir ve Antalya kıyılarından 12 örnek mera, 18 örnek av ve 18 balık seçeneği bulunur. Örnek avlar akışta etiketlenir. Çinekop, sarıkanat ve lüfer aynı türün yerel boy adları olarak ayrı seçeneklerdir.

Yeni meralar, avlar ve sıkıştırılmış base64 fotoğraflar bu tarayıcıdaki LocalStorage alanına kaydedilir. Başka cihazlara aktarım yapılmaz. Harita döşemeleri internet bağlantısı ister. GPS için konum izni ve güvenli bir adres (HTTPS veya localhost) gerekir.

Harita verileri © [OpenStreetMap katkıcıları](https://www.openstreetmap.org/copyright).

