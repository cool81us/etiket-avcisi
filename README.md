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
├── index.html      # Ana HTML dosyası, tüm ekranlar
├── style.css       # Tüm stiller
├── script.js       # Oyun mantığı, GameState, Scoring, HintSystem, Game, ReportExporter, App
├── analytics.js    # Analitik motoru, Rozet Sistemi (15 rozet), Rapor Oluşturucu
└── levels.js       # 10 seviye, 100 soru
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
- [ ] localStorage'a veri kaydediliyor/yükleniyor
- [ ] Mobil görünüm uygun
- [ ] Hata mesajları saygılı
- [ ] Konsol hatası yok
