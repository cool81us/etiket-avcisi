# Etiket Avcısı - HTML Eğitim Oyunu

Bu proje lise öğrencilerine HTML öğretmek amacıyla geliştirilmiş eğitim amaçlı bir web oyunudur.

## Geliştirme Kuralları

Projede mevcut çalışan özellikler korunmalıdır.

Herhangi bir değişiklik yapmadan önce mevcut kodun yapısını analiz et.

Bir özelliği eklerken mevcut:

- seviyeleri
- görevleri
- puan sistemini
- XP sistemini
- rozetleri
- ilerleme sistemini
- localStorage verilerini
- HTML kod editörünü
- canlı önizlemeyi
- mobil uyumluluğu

bozma.

Gereksiz yere çalışan kodu yeniden yazma.

Birden fazla dosyayı değiştirmek gerekiyorsa önce hangi dosyaların neden değişeceğini açıkla.

Kod değişikliklerinden önce mevcut yapıyla yeni özelliğin nasıl bütünleşeceğini açıkla.

Mevcut bir özelliği değiştirmek gerekiyorsa bunun neden gerekli olduğunu belirt.

Her değişiklikten sonra olası regresyonları kontrol et.

## Eğitimsel Yaklaşım

Öğrenci deneyimini önceliklendir.

Kodun yalnızca çalışması değil, eğitimsel açıdan da anlamlı olması gerekir.

Öğrencinin hata yapmasını öğrenme sürecinin bir parçası olarak kabul et.

Hata mesajları öğrenciyi küçümseyici veya cezalandırıcı olmamalıdır.

Öğrencinin doğru cevabı sadece tahmin ederek geçmesini değil, HTML mantığını anlamasını sağlayacak görevler oluştur.

## Kod Standartları

Yeni özellik geliştirirken mümkün olduğunca mevcut mimariye uygun ve sürdürülebilir çözümler kullan.

Bir isteği yerine getirirken mevcut kodun tamamını gereksiz yere yeniden üretme. Sadece değişen dosyaları veya değişen bölümleri göster.

Ancak bir dosyanın tamamının değiştirilmesi gerçekten gerekiyorsa dosyanın güncel ve eksiksiz halini ver.

Her geliştirme sonrasında manuel olarak test edilebilecek bir kontrol listesi oluştur.

## Proje Yapısı

```
etiket-avcisi/
├── index.html      # Ana HTML dosyasi, tum ekranlar + soru editoru overlay
├── style.css       # Tum stiller (ogretmen paneli, soru editoru dahil)
├── script.js       # Oyun mantigi, GameState, QuestionOverrides, TeacherDashboard, App
├── api.js          # Backend API servis katmani (soru override metodlari dahil)
├── analytics.js    # Analitik motoru, Rozet Sistemi (15 rozet), Rapor Olusturucu
├── levels.js       # 10 seviye, 100 soru (orijinal - override'lar uzerine biner)
└── backend/
    ├── server.js            # Express sunucu
    ├── config.js            # Yapilandirma (env degiskenleri)
    ├── db/schema.sql        # 7 tablo (question_overrides dahil)
    ├── middleware/auth.js   # JWT dogrulama + rol yetkisi
    └── routes/
        ├── auth.js          # Kayit, giris, profil
        ├── student.js       # Ogrenci ilerleme/istatistik
        ├── teacher.js       # Ogrenci listesi, sinif istatistikleri
        └── questions.js     # Soru override (ogretmen ozellestirme)
```

## Dosya Sorumlulukları

| Dosya | İçerik |
|-------|--------|
| `script.js` | GameState (veri yönetimi), Scoring (puan + XP), HintSystem, Game (anasayfa mantığı), LevelSelect, Editor, Preview, ReportExporter, App (başlatma + event listener'lar) |
| `analytics.js` | Analytics (rapor hesaplama), BadgeSystem (15 rozet tanımı + kontrol), ReportRenderer (HTML rapor oluşturma) |
| `levels.js` | Seviye tanımları, soru tipleri (multiple-choice, code-fill, code-write, code-fix, predict) |
| `index.html` | Tüm ekranlar: menu, name-input, level-select, game, code-editor, game-over, all-complete, feedback-overlay, hint-overlay, summary-overlay, report |
| `style.css` | Tüm stiller, responsive tasarım |

## Mevcut Sistemler

### Veri Yapısı (localStorage: `etiketAvcisi_gameState`)
- `playerName`, `score`, `totalScore`, `lives`, `streak`, `maxStreak`
- `completedLevels` (yıldız, puan, tamamlandı, deneme, süre, ipucu, doğruOran, xp)
- `xp`, `xpLevel`, `badges`, `errorHistory`, `questionHistory`, `hintStats`, `levelAttempts`
- `totalPlayTime`, `sessionStartTime`, `lastPlayed`

### Puan Sistemi
- İlk deneme: 100, İkinci: 70, İpucuyla: 50, Üçüncü+: 30
- Streak bonusu: 3'te +30, 5'te +75, 10'da +200
- İpucu cezası: -20

### XP Sistemi
- Baz: 10 XP, İlk deneme bonusu: +5, İpucu kullanmadı: +5
- Seviye eşikleri: 500/1500/3000/5000/8000/12000

### Yıldız Sistemi
- 3 yıldız: ≥%90, 2 yıldız: ≥%70, 1 yıldız: ≥%50

### Kilit Sistemi
- Bir sonraki seviye: %60 başarı, Final seviyesi: %70

### Rozetler (15 adet)
first_step, fire_streak, diamond_eye, speed_demon, error_hunter, sharpshooter, level_master, puzzle_master, data_analyst, retry_master, time_master, scholar, champion, hint_free, streak_master

## Soru Ozellestirme Sistemi (Ogretmen)

Ogretmen panelindeki "Sorular" sekmesinden sorulari duzenleyebilir, yeni soru ekleyebilir ve silebilir.

- Sorular `levels.js`'te kalir; degisiklikler backend'de `question_overrides` tablosunda saklanir
- Ogrenci giris yapinca override'lar `LEVELS` uzerine uygulanir
- Offline / giris yoksa orijinal sorular kullanilir
- "Bu Seviyeyi Orijinaline Don" ile degisiklikler geri alinir
- Desteklenen tipler: multiple-choice, code-fill, code-write, code-fix, predict

## Kontrol Listesi (Test)

Her geliştirme sonrası kontrol edilecekler:

- [ ] Oyun açılabilir durumda (menü ekranı görünüyor)
- [ ] İsim girişi çalışıyor
- [ ] Seviye seçim ekranı seviyeleri gösteriyor
- [ ] Seviye kilitleme/ kilidi açma çalışıyor
- [ ] Sorular doğru render ediliyor
- [ ] Doğru/yanlış cevap bildirimi çalışıyor
- [ ] İpucu sistemi çalışıyor
- [ ] Puan doğru hesaplanıyor
- [ ] XP doğru hesaplanıyor
- [ ] Can sistemi çalışıyor
- [ ] Kod editörü açılıyor ve çalışıyor
- [ ] Canlı önizleme çalışıyor
- [ ] Seviye tamamlanıyor
- [ ] "Ne Öğrendin?" özeti görünüyor
- [ ] Sonuç ekranı yıldızları gösteriyor
- [ ] Rapor ekranı açılıyor
- [ ] Rapor verileri doğru
- [ ] CSV dışa aktarma çalışıyor
- [ ] Rozetler doğru kontrol ediliyor
- [ ] localStorage'a veri kaydediliyor/yukleniyor
- [ ] Mobil gorunum uygun
- [ ] Hata mesajlari saygili
- [ ] Konsol hatasi yok

### Soru Ozellestirme Testleri

- [ ] Ogretmen girisi yapildiginda panelde "Ogrenciler" ve "Sorular" sekmeleri gorunuyor
- [ ] "Sorular" sekmesinde seviye secici calisiyor
- [ ] Soru listesi seviye sorularini gosteriyor (tip rozeti + metin)
- [ ] "Duzenle" ile editor overlay aciliyor
- [ ] Soru tipi degistirince alanlar guncelleniyor
- [ ] multiple-choice: 4 secenek + dogru cevap radyosu calisiyor
- [ ] code-fill: sablon + blanks girisi, ____ sayisi kontrolu calisiyor
- [ ] code-write: requirements + validation alanlari calisiyor
- [ ] code-fix: kod satirlari + hata satiri ekleme/silme calisiyor
- [ ] "Kaydet" ile degisiklik backend'e kaydediliyor
- [ ] "Yeni Soru" ile soru ekleniyor (Yeni rozeti gorunuyor)
- [ ] "Sil" ile soru siliniyor (confirm soruyor)
- [ ] Duzenlenen soruda "Duzenlenmis" rozeti gorunuyor
- [ ] Ogrenci giris yapinca degistirilmis sorulari goruyor
- [ ] "Bu Seviyeyi Orijinaline Don" ile reset calisiyor
- [ ] Ogrenci "Sorular" sekmesine erisemiyor (403)
- [ ] Escape ile editor kapaniyor
- [ ] Overlay disina tiklayinca editor kapaniyor
