/**
 * ============================================
 * ETİKET AVCISI - Seviye Tanımları
 * ============================================
 * Bu dosyada oyunun seviyeleri ve soruları tanımlanır.
 * Yeni seviye eklemek için bu dosyaya yeni bir nesne eklemeniz yeterlidir.
 *
 * Seviye Yapısı:
 * - id: Benzersiz seviye numarası
 * - name: Seviye adı
 * - description: Kısa açıklama
 * - icon: Emoji ikon
 * - tags: Öğretilen HTML etiketleri
 * - questions: Soru dizisi
 *
 * Soru Türleri:
 * - multiple-choice: Çoktan seçmeli (4 seçenek)
 * - code-fill: Kod içindeki boşlukları doldurma
 * - code-write: Sıfırdan HTML kod yazma
 * - code-fix: Hatalı kodu düzeltme
 * - predict: Kodun ekranda ne oluşturacağını tahmin etme
 */

const LEVELS = [
  // ==========================================
  // SEVİYE 1: "Kapıya Geldik"
  // HTML belgesinin temel yapısı
  // ==========================================
  {
    id: 1,
    name: "Kapıya Geldik",
    description: "HTML belgesinin temel yapısını öğren",
    icon: "🚪",
    tags: ["<!DOCTYPE html>", "<html>", "<head>", "<body>", "<title>"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "<!DOCTYPE html> bildiriminin amacı nedir?",
        code: null,
        options: [
          "Sayfaya başlık ekler",
          "Tarayıcıya HTML5 olduğunu söyler",
          "Sayfayı güzelleştirir",
          "JavaScript çalıştırır"
        ],
        correct: 1,
        hint: "Bu bildirim tarayıcıya sayfanın hangi HTML sürümüyle yazıldığını söyler.",
        explanation:
          "<!DOCTYPE html> tarayıcıya sayfanın HTML5 ile yazıldığını bildirir. Bu, sayfanın en başına yazılır."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "HTML sayfasının tüm içeriğini saran etiket hangisidir?",
        code: null,
        options: ["<body>", "<html>", "<head>", "<page>"],
        correct: 1,
        hint: "Bu etiket sayfanın en dış kabuğudur, her şey bu etiketin içinde yer alır.",
        explanation:
          "<html> etiketi tüm HTML belgesini sarar. <!DOCTYPE html>'den sonra, </html>'den önce gelir."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "<head> bölümü içinde aşağıdakilerden hangisi bulunur?",
        code: null,
        options: [
          "Ekranda görünen yazılar",
          "Sayfa hakkında bilgiler (başlık, meta)",
          "Görseller ve videolar",
          "Formlar ve butonlar"
        ],
        correct: 1,
        hint: "<head> bölümü görünmez, sayfa hakkında bilgi verir.",
        explanation:
          "<head> bölümü sayfa hakkında bilgi içerir. <title>, <meta>, <link> gibi etiketler burada yer alır."
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "Tarayıcı sekmesinde görünen başlık hangi etiketle yazılır?",
        code: null,
        options: ["<header>", "<title>", "<heading>", "<meta>"],
        correct: 1,
        hint: "Bu etiket <head> bölümü içinde yer alır.",
        explanation:
          "<title> etiketi tarayıcı sekmesinde görünen başlığı belirler ve <head> bölümü içinde yer alır."
      },
      {
        id: 5,
        type: "code-fill",
        question: "Eksik HTML etiketlerini tamamlayın:",
        template: [
          "&lt;!DOCTYPE html&gt;",
          "&lt;html&gt;",
          "  &lt;____&gt;",
          "    &lt;title&gt;Benim Sayfam&lt;/title&gt;",
          "  &lt;/head&gt;",
          "  &lt;body&gt;",
          "    &lt;h1&gt;Merhaba Dunya&lt;/h1&gt;",
          "  &lt;/body&gt;",
          "&lt;/html&gt;"
        ],
        blanks: ["head"],
        hint: "Sayfa hakkında bilgi taşıyan bölüm hangisiydi?",
        explanation:
          "<head> bölümü, <title> gibi sayfa hakkında bilgi veren etiketleri barındırır."
      },
      {
        id: 6,
        type: "code-fill",
        question: "Eksik kapanış etiketini tamamlayın:",
        template: [
          "&lt;!DOCTYPE html&gt;",
          "&lt;html&gt;",
          "  &lt;head&gt;",
          "    &lt;title&gt;Benim Sayfam&lt;/title&gt;",
          "  &lt;/____&gt;",
          "  &lt;body&gt;",
          "    &lt;h1&gt;Merhaba&lt;/h1&gt;",
          "  &lt;/body&gt;",
          "&lt;/html&gt;"
        ],
        blanks: ["head"],
        hint: "Her açılan etiket kapanmalıdır. <head> ile açılan etiket nasıl kapanır?",
        explanation:
          "HTML'de her açılan etiket kapanmalıdır. <head> ile açılan etiket </head> ile kapanır."
      },
      {
        id: 7,
        type: "code-write",
        question:
          "En basit HTML sayfasını yazın. Sadece gerekli temel etiketleri kullanın:",
        requirements: [
          "<!DOCTYPE html> bildirimi olmalı",
          "<html> etiketi olmalı",
          "<head> ve <body> bölümleri olmalı",
          "<title> etiketi olmalı",
          "İçerik olarak 'Merhaba' yazmalı"
        ],
        validation: {
          mustContain: ["<!DOCTYPE html>", "<html>", "</html>"],
          mustContainOne: ["<head>", "<body>"],
          mustContainOneStrict: ["<title>"],
          contentCheck: "Merhaba"
        },
        hint: "Sırayla: DOCTYPE, html, head (içinde title), body (içinde içerik), html kapanış",
        explanation:
          "Temel HTML yapısı: <!DOCTYPE html> → <html> → <head> + <body> → </html>"
      },
      {
        id: 8,
        type: "predict",
        question: "Aşağıdaki kodun tarayıcıda nasıl göründüğünü tahmin edin:",
        code: [
          "<!DOCTYPE html>",
          "<html>",
          "<head>",
          "  <title>Test Sayfasi</title>",
          "</head>",
          "<body>",
          "  <h1>Merhaba Dunya</h1>",
          "</body>",
          "</html>"
        ],
        options: [
          "Sayfada 'Merhaba Dunya' başlık olarak görünür",
          "Tarayıcı sekmesinde 'Test Sayfasi' yazısı görünür",
          "Hem选项 1 hem选项 2 doğrudur",
          "Hiçbir şey görünmez"
        ],
        correct: 2,
        hint: " hem <title> tarayıcı sekmesinde, hem <h1> sayfada görünür.",
        explanation:
          "<title> tarayıcı sekmesinde, <h1> ise sayfanın kendisinde büyük başlık olarak görünür."
      },
      {
        id: 9,
        type: "code-write",
        question:
          "'Hosgeldiniz' başlıklı bir HTML sayfası oluşturun. Başlık tarayıcı sekmesinde görünsün:",
        requirements: [
          "Sayfa yapısı doğru olmalı (DOCTYPE, html, head, body)",
          "Tarayıcı sekmesinde 'Hosgeldiniz' yazmalı",
          "Sayfa içinde 'Hosgeldiniz' başlığı olmalı"
        ],
        validation: {
          mustContain: ["<!DOCTYPE html>", "<html>", "</html>"],
          mustContainOne: ["<head>", "<body>"],
          mustContainOneStrict: ["<title>"],
          contentCheck: "Hosgeldiniz"
        },
        hint: "<title> tarayıcı sekmesini, <h1> sayfadaki başlığı belirler.",
        explanation:
          "İki 'Hosgeldiniz' olmalı: biri <title> (sekme), biri <h1> (sayfa içeriği)."
      },
      {
        id: 10,
        type: "code-fix",
        question: "Aşağıdaki HTML kodunda hataları bulup düzeltin:",
        code: [
          "<!DOCTYPE html>",
          "<html>",
          "<head>",
          "  <title>Benim Sayfam</title>",
          "<body>",
          "  <h1>Merhaba</h1>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 5,
            description: "<head> etiketi kapanmamış",
            fix: "</head> eklenecek"
          }
        ],
        hint: "Her açılan etiket kapanmalıdır. <head> etiketi ne zaman kapanıyor?",
        explanation:
          "5. satırda </head> etiketi eksik. Her açılan etiket kapanmalıdır."
      }
    ]
  },

  // ==========================================
  // SEVİYE 2: "Başlık Dağları"
  // h1-h6 başlık etiketleri
  // ==========================================
  {
    id: 2,
    name: "Baslik Daglari",
    description: "h1-h6 başlık etiketlerini öğren",
    icon: "🏔️",
    tags: ["<h1>", "<h2>", "<h3>", "<h4>", "<h5>", "<h6>"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "HTML'de en büyük başlık etiketi hangisidir?",
        code: null,
        options: ["<h6>", "<h1>", "<header>", "<title>"],
        correct: 1,
        hint: "Sayılar büyüdükçe başlık küçülür.",
        explanation:
          "<h1> en büyük, <h6> en küçük başlık etiketidir."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "Bir sayfada kaç tane <h1> etiketi bulunmalıdır?",
        code: null,
        options: [
          "Sınırsız",
          "En fazla 2",
          "Genellikle 1",
          "Hiç olmamalı"
        ],
        correct: 2,
        hint: "Sayfanın ana konusunu temsil eden bir tane başlık yeterlidir.",
        explanation:
          "Her sayfada genellikle tek bir <h1> bulunur. Bu sayfanın ana konusunu temsil eder."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "Başlık etiketlerinin doğru sıralaması nedir?",
        code: null,
        options: [
          "h1 → h3 → h2 → h4",
          "h1 → h2 → h3 → h4",
          "h6 → h5 → h4 → h3",
          "Sıralama önemli değil"
        ],
        correct: 1,
        hint: "Başlıklar hiyerarşik olmalıdır, büyükten küçüğe doğru.",
        explanation:
          "Başlıklar hiyerarşik sıralanmalıdır: h1 → h2 → h3 → h4 → h5 → h6"
      },
      {
        id: 4,
        type: "code-fill",
        question: "Eksik başlık etiketlerini tamamlayın:",
        template: [
          "<h1>Ana Baslik</h1>",
          "____<h2>Alt Baslik</h2>",
          "____<h3>Detay</h3>",
          "____<h4>Kucuk Detay</h4>"
        ],
        blanks: ["", "", ""],
        hint: "h2 ve h3 etiketlerinde '>' işareti eksik.",
        explanation:
          "Her başlık etiketinin hem açma hem de kapanış etiketi olmalıdır: <h2>...</h2>"
      },
      {
        id: 5,
        type: "code-write",
        question: "h1'den h3'e kadar başlıklar oluşturun:",
        requirements: [
          "<h1> ile 'Ana Baslik' yazın",
          "<h2> ile 'Alt Baslik 1' yazın",
          "<h3> ile 'Detay 1' yazın"
        ],
        validation: {
          mustContain: [
            "<h1>Ana Baslik</h1>",
            "<h2>Alt Baslik 1</h2>",
            "<h3>Detay 1</h3>"
          ]
        },
        hint: "Her başlık kendi etiketiyle sarılmalı: <h1>...</h1>",
        explanation:
          "Başlıklar hiyerarşik olmalı: h1 > h2 > h3"
      },
      {
        id: 6,
        type: "predict",
        question: "Bu kodun ekranda nasıl göründüğünü tahmin edin:",
        code: [
          "<h1>Buyuk Baslik</h1>",
          "<h2>Orta Baslik</h2>",
          "<h3>Kucuk Baslik</h3>"
        ],
        options: [
          "Üç başlık da aynı boyutta görünür",
          "h1 en büyük, h3 en küçük görünür",
          "h3 en büyük, h1 en küçük görünür",
          "Sadece h1 görünür"
        ],
        correct: 1,
        hint: "Sayılar büyüdükçe yazı boyutu küçülür.",
        explanation:
          "h1 en büyük, h2 orta, h3 en küçük başlık olarak görünür."
      },
      {
        id: 7,
        type: "code-write",
        question:
          "Bir 'Seyahat Rehberi' sayfası oluşturun. Başlıklar hiyerarşik olmalı:",
        requirements: [
          "<h1> ile 'Seyahat Rehberi' (ana başlık)",
          "<h2> ile 'Istanbul' (alt başlık)",
          "<h2> ile 'Ankara' (alt başlık)",
          "Her iki şehir altında <h3> ile 'Gezilecek Yerler'"
        ],
        validation: {
          mustContain: ["Seyahat Rehberi", "Istanbul", "Ankara", "Gezilecek Yerler"]
        },
        hint: "h1 ana başlık, h2 şehirler, h3 alt bölümler olmalı.",
        explanation:
          "Hiyerarşi: h1 (sayfa) > h2 (bölümler) > h3 (alt bölümler)"
      },
      {
        id: 8,
        type: "code-fix",
        question: "Aşağıdaki kodda hataları bulun ve düzeltin:",
        code: [
          "<h1>Ana Baslik</h1>",
          "<h3>Atlanmis Baslik</h3>",
          "<h2>h3'ten sonra h2</h2>",
          "<h7>Bu etiket yok</h7>"
        ],
        errors: [
          {
            line: 2,
            description: "h2 atlanmış, h3 kullanılmış",
            fix: "h2 kullanılmalı"
          },
          {
            line: 4,
            description: "h7 etiketi mevcut değil",
            fix: "h7 yerine h6 veya daha küçük bir etiket kullanılmalı"
          }
        ],
        hint: "h2 atlanmış ve h7 diye bir etiket yok.",
        explanation:
          "Başlıklar sırayla gitmeli: h1 → h2 → h3. h7 diye bir etiket yoktur."
      },
      {
        id: 9,
        type: "code-write",
        question:
          "Bir 'Yemek Menusu' sayfası oluşturun:",
        requirements: [
          "<h1> ile 'Yemek Menusu'",
          "<h2> ile 'Ana Yemekler'",
          "İki tane <h3> ile yemek adları (ör: 'Kuru fasulye', 'Pilav')",
          "<h2> ile 'Tatlilar'",
          "Bir tane <h3> ile tatlı adı (ör: 'Sutlac')"
        ],
        validation: {
          mustContain: ["Yemek Menusu", "Ana Yemekler", "Kuru fasulye", "Pilav", "Tatlilar", "Sutlac"]
        },
        hint: "h1 menü, h2 kategoriler, h3 yemekler olmalı.",
        explanation:
          "Menü yapısı: h1 (başlık) > h2 (kategori) > h3 (ürün)"
      },
      {
        id: 10,
        type: "code-fix",
        question: "Bu kodu hatalı kısımları bularak düzeltin:",
        code: [
          "<!DOCTYPE html>",
          "<html>",
          "<head><title>Baslik Ornegi</title></head>",
          "<body>",
          "  <h1>Ana Baslik</h1>",
          "  <h1>Baska Bir Ana Baslik</h1>",
          "  <h3>h2 Atlandi</h3>",
          "  <h5>cok kucuk</h5>",
          "  <h3>h4 Atlandi</h3>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 6,
            description: "İki tane h1 var, biri h2 olmalı",
            fix: "İkinci h1 yerine h2 kullanılmalı"
          },
          {
            line: 7,
            description: "h2 atlanmış",
            fix: "h3 yerine h2 kullanılmalı"
          }
        ],
        hint: "Bir sayfada tek h1 olmalı ve başlıklar sırayla gitmeli.",
        explanation:
          "Tek h1, ardından h2 → h3 → h4 sıralaması doğru olanıdır."
      }
    ]
  },

  // ==========================================
  // SEVİYE 3: "Paragraf Çölü"
  // p, br ve hr etiketleri
  // ==========================================
  {
    id: 3,
    name: "Paragraf Colu",
    description: "p, br ve hr etiketlerini öğren",
    icon: "🏜️",
    tags: ["<p>", "<br>", "<hr>", "</p>"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "<p> etiketinin temel amacı nedir?",
        code: null,
        options: [
          "Sayfaya başlık ekler",
          "Paragraf oluşturur",
          "Satır atlar",
          "Yatay çizgi çizer"
        ],
        correct: 1,
        hint: "p kelimesi 'paragraph' (paragraf) kısaltmasıdır.",
        explanation:
          "<p> etiketi paragraf oluşturur. Her paragraf kendi satırında başlar ve biter."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "<br> etiketi ne yapar?",
        code: null,
        options: [
          "Paragraf başlatır",
          "Yeni satır oluşturur (satır atlar)",
          "Yatay çizgi çizer",
          "Metni kalın yapar"
        ],
        correct: 1,
        hint: "br kelimesi 'break' (kırılma) kısaltmasıdır.",
        explanation:
          "<br> etiketi mevcut satırı kırar ve içeriği yeni satıra taşır."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "<br> etiketinin kapanış etiketi var mıdır?",
        code: null,
        options: [
          "Evet, </br> yazılmalıdır",
          "Hayır, self-closing bir etikettir",
          "İsteğe bağlıdır",
          "Sadece XHTML'de gerekir"
        ],
        correct: 1,
        hint: "Bazı etiketler kendi kendini kapatır, içeriği yoktur.",
        explanation:
          "<br> self-closing bir etikettir. İçerik barındırmaz, sadece satır atlama komutu verir."
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "<hr> etiketi ne işe yarar?",
        code: null,
        options: [
          "Sayfayı tamamen temizler",
          "Yatay bir çizgi (ayraç) çizer",
          "Yeni sayfa başlatır",
          "Resim ekler"
        ],
        correct: 1,
        hint: "hr kelimesi 'horizontal rule' (yatay kural) kısaltmasıdır.",
        explanation:
          "<hr> etiketi sayfada yatay bir ayraç çizgisi oluşturur. Genellikle bölüm ayırıcı olarak kullanılır."
      },
      {
        id: 5,
        type: "code-fill",
        question: "Eksik etiketleri tamamlayın:",
        template: [
          "<h1>Baslik</h1>",
          "____Birinci paragraf burada yaziyor.____",
          "____",
          "____Ikinci paragraf burada yaziyor.____"
        ],
        blanks: ["<p>", "</p>", "<br>", "<p>", "</p>"],
        hint: "Her paragraf <p> ile açılıp </p> ile kapanır.",
        explanation:
          "Paragraflar <p> ile sarılır. <br> ise satır atlamak için kullanılır."
      },
      {
        id: 6,
        type: "code-write",
        question: "İki paragraf ve aralarında yatay çizgi olan bir kod yazın:",
        requirements: [
          "İlk paragraf: 'Bu birinci paragraftir.'",
          "Ardından <hr> ile yatay çizgi",
          "İkinci paragraf: 'Bu ikinci paragraftir.'"
        ],
        validation: {
          mustContain: [
            "<p>Bu birinci paragraftir.</p>",
            "<hr>",
            "<p>Bu ikinci paragraftir.</p>"
          ]
        },
        hint: "Sırayla: <p>...</p>, <hr>, <p>...</p>",
        explanation:
          "Paragraflar <p> ile sarılır, <hr> araya yatay çizgi ekler."
      },
      {
        id: 7,
        type: "predict",
        question: "Bu kodun ekranda nasıl göründüğünü tahmin edin:",
        code: [
          "<h1>Sayfa Basligi</h1>",
          "<p>Birinci paragraf.</p>",
          "<p>Ikinci paragraf.</p>",
          "<hr>",
          "<p>Ucuncu paragraf.</p>"
        ],
        options: [
          "Tüm metin tek satırda görünür",
          "Üç paragraf ayrı satırlarda, ortada yatay çizgi var",
          "Sadece başlık görünür",
          "Hata oluşur"
        ],
        correct: 1,
        hint: "<p> her paragrafı ayrı satıra, <hr> yatay çizgi çizer.",
        explanation:
          "<p> paragrafları ayrı satırlara yerleştirir, <hr> ise araya yatay çizgi ekler."
      },
      {
        id: 8,
        type: "code-write",
        question:
          "Bir 'Hayvanlar Hakkinda' sayfası oluşturun:",
        requirements: [
          "<h1> ile 'Hayvanlar Hakkinda'",
          "<hr> ile ayırıcı çizgi",
          "<p> ile 'Kediler sevimli hayvanlardir.'",
          "<p> ile 'Kopekler sadik hayvanlardir.'",
          "<hr> ile另一个 ayirici cizgi",
          "<p> ile 'Tum hayvanlara saygi duymaliyiz.'"
        ],
        validation: {
          mustContain: ["Hayvanlar Hakkinda", "Kediler", "Kopekler", "Tum hayvanlara"]
        },
        hint: "Başlık, ardından paragraflar ve ayırıcı çizgiler.",
        explanation:
          "Sayfa yapısı: başlık → içerik paragrafları → ayırıcılar → kapanış."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Aşağıdaki koddaki hataları bulun ve düzeltin:",
        code: [
          "<h1>Paragraf Ornegi</h1>",
          "<p>Birinci paragraf",
          "Ikinci satir</p>",
          "<p>Ikinci paragraf</p>",
          "<br>",
          "Paragraf olmadan metin</p>",
          "<hr>"
        ],
        errors: [
          {
            line: 6,
            description: "Eksik <p> etiketi, kapanış etiketi var ama açma yok",
            fix: "<p> eklenecek"
          }
        ],
        hint: "6. satırda </p> var ama başlangıç <p> etiketi eksik.",
        explanation:
          "Her </p> kapanış etiketinin karşılığında <p> açma etiketi olmalıdır."
      },
      {
        id: 10,
        type: "code-write",
        question: "Tam bir sayfa oluşturun:",
        requirements: [
          "Temel HTML yapısı (DOCTYPE, html, head, body)",
          "<title> 'Paragraf Ornegi'",
          "<h1> ile 'Paragraf Ornegi'",
          "İki paragraf: 'Bu sayfa paragraf ornegi gostermek icin hazirlanmistir.' ve 'Paragraflar <p> etiketi ile olusturulur.'",
          "Aralarında <hr> ile ayırıcı",
          "<p> ile 'Sayfamizin sonuna geldik.'"
        ],
        validation: {
          mustContain: [
            "<!DOCTYPE html>",
            "<html>",
            "</html>",
            "<head>",
            "<body>",
            "<title>",
            "<h1>",
            "<p>",
            "<hr>"
          ]
        },
        hint: "Tüm bilgileri birleştirin: yapı + başlık + içerik + ayırıcı.",
        explanation:
          "HTML sayfası: yapı (DOCTYPE, html) → başlık (head/title) → içerik (body/h1/p/hr)."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "<p> etiketinin paragraf oluşturduğunu",
        "<br> ile satır atlandığını (self-closing)",
        "<hr> ile yatay çizgi (ayraç) çizildiğini",
        "Paragrafların <p> ile sarılması gerektiğini",
        "Metin düzeninde bu üç etiketin birlikte kullanıldığını"
      ]
    }
  },

  // ==========================================
  // SEVİYE 4: "Köprüler Şehri"
  // a (bağlantı) etiketi
  // ==========================================
  {
    id: 4,
    name: "Kopru Sehri",
    description: "a baglanti etiketini ogren",
    icon: "🌉",
    tags: ["<a>", "href", "target", "</a>"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "<a> etiketinin temel amaci nedir?",
        code: null,
        options: [
          "Goster ekler",
          "Sayfalar arasi baglanti kurar",
          "Metni kalin yapar",
          "Satir atlar"
        ],
        correct: 1,
        hint: "a kelimesi 'anchor' (capa) kelimesinden gelir.",
        explanation: "<a> etiketi sayfalar arasi baglanti kurar."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "Baglantinin hedefini tanimlayan onnitelik hangisidir?",
        code: null,
        options: ["src", "href", "link", "url"],
        correct: 1,
        hint: "Bu onnitelik 'hypertext reference' kisalmasidir.",
        explanation: "href onniteligi baglantinin hedef URL'sini belirtir."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "Baglanti metni nereye yazilir?",
        code: null,
        options: [
          "href onniteligine",
          "<a> ve </a> arasina",
          "<a> etiketinden once",
          "Baska bir etiket icine"
        ],
        correct: 1,
        hint: "Kullanici tiklayacagi metni gorur, bu metin etiketin icinde olmali.",
        explanation: "Baglanti metni <a> ve </a> arasina yazilir."
      },
      {
        id: 4,
        type: "code-fill",
        question: "Eksik baglanti etiketini tamamlayin:",
        template: [
          "&lt;a ____=\"https://ornek.com\"&gt;Ornek Site&lt;/a&gt;"
        ],
        blanks: ["href"],
        hint: "Baglantinin hedefini belirten onnitelik?",
        explanation: "href onniteligi baglantinin hedefini belirtir."
      },
      {
        id: 5,
        type: "code-fill",
        question: "Yeni sekmede acan baglantiyi tamamlayin:",
        template: [
          "&lt;a href=\"https://ornek.com\" ____=\"_blank\"&gt;Tikla&lt;/a&gt;"
        ],
        blanks: ["target"],
        hint: "Hangi sekmede acilacagini belirtir.",
        explanation: "target=\"_blank\" baglantiyi yeni sekmede acar."
      },
      {
        id: 6,
        type: "code-write",
        question: "https://google.com adresine giden 'Google'a Git' baglantisi yazin:",
        requirements: [
          "<a> etiketi kullanilmali",
          "href onniteligi olmali",
          "Baglanti metni 'Google'a Git' olmali"
        ],
        validation: {
          mustContain: ["<a", "href", "Google'a Git", "</a>"]
        },
        hint: "Yapi: <a href=\"URL\">Baglanti Metni</a>",
        explanation: "Dogru yapi: <a href=\"https://google.com\">Google'a Git</a>"
      },
      {
        id: 7,
        type: "code-write",
        question: "Yeni sekmede acilan bir baglanti yazin:",
        requirements: [
          "href onniteligi olmali",
          "target=\"_blank\" olmali",
          "Herhangi bir URL ve metin kullanabilirsiniz"
        ],
        validation: {
          mustContain: ["<a", "href=", "target=\"_blank\"", "</a>"]
        },
        hint: "target=\"_blank\" yeni sekme acar.",
        explanation: "Yeni sekme icin target=\"_blank\" kullanilir."
      },
      {
        id: 8,
        type: "code-fix",
        question: "Asagidaki baglanti kodunda hatalari bulun:",
        code: [
          "<a href=\"https://ornek.com\">Ornek Site</a>",
          "<a>Baglanti Eksik</a>",
          "<a href=\"https://google.com\">Google</a>"
        ],
        errors: [
          {
            line: 2,
            description: "href onniteligi eksik",
            fix: "href eklenmeli"
          }
        ],
        hint: "Her <a> etiketinde href onniteligi olmali.",
        explanation: "2. satirda href onniteligi eksik."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Asagidaki koddaki hatayi bulun ve duzeltin:",
        code: [
          "<a href=\"https://ornek.com\">Site</a>",
          "<a href=\"https://google.com\">Google</a>",
          "<a>Link</a>"
        ],
        errors: [
          {
            line: 3,
            description: "3. baglantida href eksik",
            fix: "href eklenmeli"
          }
        ],
        hint: "3. baglantida href onniteligi nerede?",
        explanation: "3. baglantida href onniteligi eksik."
      },
      {
        id: 10,
        type: "code-write",
        question: "Iki baglanti olusturun: biri google.com'a, digeri ornek.com'a gitsin:",
        requirements: [
          "Iki farkli <a> etiketi olmali",
          "Her birinin href onniteligi olmali",
          "Farkli baglanti metinleri olmali"
        ],
        validation: {
          mustContain: ["<a", "href=", "</a>"]
        },
        hint: "Iki satir baglanti yazin, her biri farkli URL'e gitsin.",
        explanation: "Her baglanti kendi <a> etiketi icinde olmali."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "<a> etiketinin sayfalar arasi baglanti kurdugunu",
        "href onniteliginin baglantinin hedefini belirttigini",
        "Baglanti metninin <a> ve </a> arasina yazildigini",
        "target=\"_blank\" ile yeni sekmede acilabildigini",
        "Her <a> etiketinde href olmasi gerektigini"
      ]
    }
  },

  // ==========================================
  // SEVİYE 5: "Görsel Galeri"
  // img etiketi
  // ==========================================
  {
    id: 5,
    name: "Gorsel Galeri",
    description: "img etiketini ogren",
    icon: "🖼️",
    tags: ["<img>", "src", "alt", "width", "height"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "img etiketinin gorevi nedir?",
        code: null,
        options: [
          "Metin yazar",
          "Gorsel gosterir",
          "Baglanti kurar",
          "Tablo olusturur"
        ],
        correct: 1,
        hint: "img kelimesi 'image' (gorsel) kisalmasidir.",
        explanation: "<img> etiketi sayfaya gorsel ekler."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "Gorselin yolunu/URL'sini belirten onnitelik hangisidir?",
        code: null,
        options: ["href", "src", "alt", "link"],
        correct: 1,
        hint: "Bu onnitelik 'source' (kaynak) kelimesinden gelir.",
        explanation: "src onniteligi gorselin yolunu/URL'sini belirtir."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "<img> etiketinin kapanis etiketi var midir?",
        code: null,
        options: [
          "Evet, </img> yazilmalidir",
          "Hayir, self-closing bir etikettir",
          "Istee baglidir",
          "Sadece XHTML'de gerekir"
        ],
        correct: 1,
        hint: "Bazi etiketler icerik barindirmaz, kendi kendini kapatir.",
        explanation: "<img> self-closing bir etikettir, icerik barindirmaz."
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "Gorsel yuklenemediginde gorunen metin hangi onnitelikle yazilir?",
        code: null,
        options: ["title", "alt", "description", "text"],
        correct: 1,
        hint: "Bu onnitelik 'alternative' (alternatif) kelisinin kisalmasidir.",
        explanation: "alt onniteligi gorsel yuklenemediginde gorunen alternatif metni belirtir."
      },
      {
        id: 5,
        type: "code-fill",
        question: "Eksik img etiketini tamamlayin:",
        template: [
          "&lt;img ____=\"foto.jpg\" alt=\"Fotograf\"&gt;"
        ],
        blanks: ["src"],
        hint: "Gorselin yolunu/URL'sini belirten onnitelik?",
        explanation: "src onniteligi gorselin yolunu belirtir."
      },
      {
        id: 6,
        type: "code-fill",
        question: "Alternatif metni ekleyin:",
        template: [
          "&lt;img src=\"kedi.jpg\" ____=\"Kucuk bir kedi\"&gt;"
        ],
        blanks: ["alt"],
        hint: "Gorsel yuklenemediginde gorunecek metin?",
        explanation: "alt onniteligi erisilebilirlik icin onemlidir."
      },
      {
        id: 7,
        type: "code-write",
        question: "manzara.jpg gorselini gosteren img etiketi yazin:",
        requirements: [
          "src onniteligi olmali",
          "alt onniteligi olmali",
          "Gorsel yolu 'manzara.jpg' olmali"
        ],
        validation: {
          mustContain: ["<img", "src=\"manzara.jpg\"", "alt="]
        },
        hint: "Yapi: <img src=\"yol\" alt=\"aciklama\">",
        explanation: "Dogru yapi: <img src=\"manzara.jpg\" alt=\"Manzara\">"
      },
      {
        id: 8,
        type: "code-write",
        question: "300x200 piksel boyutunda gorsel olusturun:",
        requirements: [
          "src onniteligi olmali",
          "alt onniteligi olmali",
          "width=\"300\" olmali",
          "height=\"200\" olmali"
        ],
        validation: {
          mustContain: ["<img", "src=", "alt=", "width=\"300\"", "height=\"200\""]
        },
        hint: "width ve height onnitelikleri boyutu belirtir.",
        explanation: "Boyut icin width ve height onnitelikleri kullanilir."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Asagidaki img kodunda hatalari bulun:",
        code: [
          "<img src=\"foto.jpg\">",
          "<img src=\"kedi.jpg\" alt=\"Kedi\">",
          "<img alt=\"Gorsel\" >"
        ],
        errors: [
          {
            line: 1,
            description: "1. img'de alt onniteligi eksik",
            fix: "alt eklenmeli"
          },
          {
            line: 3,
            description: "3. img'de src onniteligi eksik",
            fix: "src eklenmeli"
          }
        ],
        hint: "Her <img>'de hem src hem de alt olmali.",
        explanation: "Her <img> etiketinde hem src hem de alt onniteligi olmalidir."
      },
      {
        id: 10,
        type: "code-fix",
        question: "Hatali gorsel kodunu duzeltin:",
        code: [
          "<img src=\"kedi.jpg\" alt=\"Kedi\">",
          "<img src=\"\">",
          "<img alt=\"Gorsel yok\">"
        ],
        errors: [
          {
            line: 2,
            description: "src degeri bos",
            fix: "Gorsel yolu eklenmeli"
          },
          {
            line: 3,
            description: "src onniteligi tamamen eksik",
            fix: "src eklenmeli"
          }
        ],
        hint: "Her <img>'de src onniteligi gorsel yolu icermeli.",
        explanation: "src onniteligi gorsel yolu icermeli, bos olamaz."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "<img>'nin self-closing bir etiket oldugunu",
        "src onniteliginin gorselin yolunu/URL'sini belirttigini",
        "alt onniteliginin erisilebilirlik icin zorunlu oldugunu",
        "width ve height ile boyut ayarlama yapildigini",
        "Her <img>'de hem src hem alt olmasi gerektigini"
      ]
    }
  },

  // ==========================================
  // SEVİYE 6: "Sıralama Meydanı"
  // ul, ol, li listeleri
  // ==========================================
  {
    id: 6,
    name: "Siralam Meydani",
    description: "ul, ol ve li listelerini ogren",
    icon: "📋",
    tags: ["<ul>", "<ol>", "<li>", "</ul>", "</ol>", "</li>"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "<ul> ne turu bir liste olusturur?",
        code: null,
        options: [
          "Numarali liste",
          "Madde isareti (sirasiZ) liste",
          "Tablo",
          "Paragraf"
        ],
        correct: 1,
        hint: "ul kelimesi 'unordered list' (sirasiz liste) kisalmasidir.",
        explanation: "<ul> madde isareti ile sirasiZ liste olusturur."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "<ol> ne turu bir liste olusturur?",
        code: null,
        options: [
          "Madde isareti liste",
          "Numarali (sirali) liste",
          "Baglanti listesi",
          "Baslik listesi"
        ],
        correct: 1,
        hint: "ol kelimesi 'ordered list' (sirali liste) kisalmasidir.",
        explanation: "<ol> numarali sirali liste olusturur."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "Liste elemanlarini hangi etiketle tanimlariz?",
        code: null,
        options: ["<li>", "<list>", "<item>", "<el>"],
        correct: 0,
        hint: "li kelimesi 'list item' (liste elemani) kisalmasidir.",
        explanation: "<li> liste elemanini tanimlar."
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "<li> etiketi nerede kullanilir?",
        code: null,
        options: [
          "Herhangi bir yerde",
          "Sadece <ul> icinde",
          "<ul> veya <ol> icinde",
          "Sadece <body> icinde"
        ],
        correct: 2,
        hint: "<li> her iki liste turunde de kullanilir.",
        explanation: "<li> hem <ul> hem de <ol> icinde kullanilir."
      },
      {
        id: 5,
        type: "code-fill",
        question: "Sirasiz listeyi tamamlayin:",
        template: [
          "&lt;ul&gt;",
          "  &lt;li&gt;Elma&lt;/li&gt;",
          "  &lt;li&gt;Armut&lt;/li&gt;",
          "&lt;/____&gt;"
        ],
        blanks: ["ul"],
        hint: "Liste basladigi etiketle kapanmali.",
        explanation: "<ul> ile baslayan liste </ul> ile kapanir."
      },
      {
        id: 6,
        type: "code-fill",
        question: "Sirali listeyi tamamlayin:",
        template: [
          "&lt;____&gt;",
          "  &lt;li&gt;Birinci&lt;/li&gt;",
          "  &lt;li&gt;Ikinci&lt;/li&gt;",
          "&lt;/ol&gt;"
        ],
        blanks: ["ol"],
        hint: "Numarali liste hangi etiketle baslar?",
        explanation: "Numarali liste <ol> ile baslar."
      },
      {
        id: 7,
        type: "code-write",
        question: "'Meyveler' baslikli sirasiZ liste olusturun:",
        requirements: [
          "h2 ile 'Meyveler' basligi",
          "<ul> ile sirasiZ liste",
          "En az 3 <li> elemani (Elma, Armut, Muz)"
        ],
        validation: {
          mustContain: ["<h2>", "<ul>", "<li>Elma</li>", "<li>Armut</li>", "<li>Muz</li>"]
        },
        hint: "Baslik h2, liste ul icinde li'ler ile.",
        explanation: "Yapi: <h2>Baslik</h2><ul><li>...</li></ul>"
      },
      {
        id: 8,
        type: "code-write",
        question: "Numarali 'Yapilacaklar' listesi olusturun:",
        requirements: [
          "<ol> etiketi kullanilmali",
          "En az 3 <li> elemani olmali",
          "Her eleman farkli bir gorev icermeli"
        ],
        validation: {
          mustContain: ["<ol>", "<li>", "</li>", "</ol>"]
        },
        hint: "Siralama icin <ol> kullanin.",
        explanation: "Numarali liste icin <ol> kullanilir."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Asagidaki listedeki hatalari bulun:",
        code: [
          "<ul>",
          "  <li>Madde 1</li>",
          "  <li>Madde 2",
          "  <li>Madde 3</li>",
          "</ul>"
        ],
        errors: [
          {
            line: 3,
            description: "3. satirda </li> eksik",
            fix: "</li> eklenmeli"
          }
        ],
        hint: "Her <li> etiketi kapanmali.",
        explanation: "Her <li> etiketinin kapanis etiketi olmalidir."
      },
      {
        id: 10,
        type: "code-write",
        question: "Ic ice liste olusturun: Meyveler basligi altinda iki alt kategori:",
        requirements: [
          "<h3> ile 'Kirmizi Meyveler' ve 'Sari Meyveler'",
          "Her kategori icin ayri <ul> listesi",
          "Her listede en az 2 <li>"
        ],
        validation: {
          mustContain: ["<h3>", "<ul>", "<li>", "</ul>"]
        },
        hint: "Her alt kategori kendi <ul>'su icinde olmali.",
        explanation: "Ic ice listelerde her <ul> kendi elemanlarini icerir."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "<ul>'ün sirasiZ (madde isareti) liste olusturduğunu",
        "<ol>'ün sirali (numarali) liste olusturduğunu",
        "<li>'nin her iki liste turunde de kullanildigini",
        "Her <li>'nin kapanis etiketi gerektigini",
        "Listelerin ic ice kullanilabildigini"
      ]
    }
  },

  // ==========================================
  // SEVİYE 7: "Tablo Çarşısı"
  // table, tr, th, td
  // ==========================================
  {
    id: 7,
    name: "Tablo Carsisi",
    description: "table, tr, th ve td etiketlerini ogren",
    icon: "📊",
    tags: ["<table>", "<tr>", "<th>", "<td>"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "<table> ne olusturur?",
        code: null,
        options: ["Baslik", "Tablo", "Liste", "Form"],
        correct: 1,
        hint: "table kelimesi 'tablo' anlamma gelir.",
        explanation: "<table> etiketi tablo olusturur."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "Tablodaki satirlari hangi etiketle tanimlariz?",
        code: null,
        options: ["<td>", "<tr>", "<th>", "<row>"],
        correct: 1,
        hint: "tr kelimesi 'table row' (tablo satiri) kisalmasidir.",
        explanation: "<tr> tablo satirini tanimlar."
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "<th> ve <td> farki nedir?",
        code: null,
        options: [
          "Fark yok, ikisi ayni",
          "<th> baslik hucresi, <td> veri hucresi",
          "<th> satir basligi, <td> sutun basligi",
          "<th> icin renk gerekli"
        ],
        correct: 1,
        hint: "th kelimesi 'table header' (tablo basligi) kisalmasidir.",
        explanation: "<th> baslik hucresi (kalın), <td> veri hucresi olusturur."
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "Tablonun dogru yapisi nasildir?",
        code: null,
        options: [
          "table > td > tr",
          "table > tr > td/th",
          "table > th > tr",
          "tr > table > td"
        ],
        correct: 1,
        hint: "Once tablo, sonra satir, sonra hucre gelir.",
        explanation: "Dogru yapi: <table> → <tr> → <th>/<td>"
      },
      {
        id: 5,
        type: "code-fill",
        question: "Tablo yapısini tamamlayin:",
        template: [
          "&lt;table&gt;",
          "  &lt;tr&gt;",
          "    &lt;____&gt;Isim&lt;/th&gt;",
          "    &lt;th&gt;Yas&lt;/th&gt;",
          "  &lt;/tr&gt;",
          "  &lt;tr&gt;",
          "    &lt;td&gt;Ali&lt;/td&gt;",
          "    &lt;td&gt;20&lt;/td&gt;",
          "  &lt;/tr&gt;",
          "&lt;/table&gt;"
        ],
        blanks: ["th"],
        hint: "Baslik hucresi hangi etiketle tanimlanir?",
        explanation: "Baslik hucreleri <th> ile tanimlanir."
      },
      {
        id: 6,
        type: "code-write",
        question: "2 sutunlu (Renk, Kod) 1 baslik satirli tablo olusturun:",
        requirements: [
          "<table> etiketi",
          "Baslik satiri: <tr> icinde <th>Renk</th> ve <th>Kod</th>",
          "Veri satiri: <tr> icinde <td>Kirmizi</td> ve <td>#FF0000</td>"
        ],
        validation: {
          mustContain: ["<table>", "<tr>", "<th>Renk</th>", "<th>Kod</th>", "<td>Kirmizi</td>", "<td>#FF0000</td>"]
        },
        hint: "Once baslik satiri, sonra veri satiri.",
        explanation: "Tablo: baslik satiri (th) + veri satiri (td)."
      },
      {
        id: 7,
        type: "code-write",
        question: "3 sutunlu (Ad, Soyad, Not) ve 2 veri satirli tablo olusturun:",
        requirements: [
          "Baslik satiri: Ad, Soyad, Not",
          "1. veri: Ali, Veli, 85",
          "2. veri: Ayse, Kaya, 90"
        ],
        validation: {
          mustContain: ["<table>", "<tr>", "<th>", "<td>", "</tr>", "</table>"]
        },
        hint: "Her satir kendi <tr>'si icinde.",
        explanation: "Her satir icin ayri <tr> etiketi kullanilir."
      },
      {
        id: 8,
        type: "code-fix",
        question: "Asagidaki tablo kodunda hatalari bulun:",
        code: [
          "<table>",
          "  <tr>",
          "    <th>Isim</th>",
          "    <th>Yas</th>",
          "  </tr>",
          "  <tr>",
          "    <td>Ali",
          "    <td>20</td>",
          "  </tr>",
          "</table>"
        ],
        errors: [
          {
            line: 7,
            description: "7. satirda </td> eksik",
            fix: "</td> eklenmeli"
          }
        ],
        hint: "Her <td> etiketi kapanmali.",
        explanation: "Her <td> etiketinin kapanis etiketi olmalidir."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Hatali tablo yapisini duzeltin:",
        code: [
          "<table>",
          "  <td>Isim</td>",
          "  <td>Yas</td>",
          "  <tr>",
          "    <td>Ali</td>",
          "    <td>20</td>",
          "  </tr>",
          "</table>"
        ],
        errors: [
          {
            line: 2,
            description: "td etiketleri <tr> icinde degil",
            fix: "td'ler bir <tr> icine alinmali"
          },
          {
            line: 3,
            description: "Baslik hucreleri th olmali",
            fix: "td yerine th kullanilmali"
          }
        ],
        hint: "Baslik hucreleri <tr> icinde <th> ile tanimlanmali.",
        explanation: "Dogru yapi: <tr><th>Baslik</th></tr> seklinde olmali."
      },
      {
        id: 10,
        type: "code-write",
        question: "Gunlerin tablosunu olusturun: 2 sutunlu (Gun, Sayi), 3 veri satirli:",
        requirements: [
          "Baslik: Gun, Sayi",
          "Pazartesi, 1",
          "Sali, 2",
          "Carsamba, 3"
        ],
        validation: {
          mustContain: ["<table>", "<tr>", "<th>Gun</th>", "<th>Sayi</th>", "<td>Pazartesi</td>", "<td>Sali</td>", "<td>Carsamba</td>"]
        },
        hint: "Her gun kendi satirinda olmali.",
        explanation: "Her veri satiri kendi <tr>'si icinde olmalidir."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "<table>'nun tablo olusturduğunu",
        "<tr>'nin satirlari, <td>'nin veri hucrelerini temsil ettigini",
        "<th>'nin baslik hucrelerini tanimladigini ve kalın gorundugunu",
        "Tablonun mantiksal yapisinin table → tr → th/td seklinde oldugunu",
        "Her satirin kendi <tr> etiketiyle sarilmasi gerektigini"
      ]
    }
  },

  // ==========================================
  // SEVİYE 8: "Birleştirme Atölyesi"
  // Tum etiketlerin birlikte kullanimi
  // ==========================================
  {
    id: 8,
    name: "Birlestirme Atolyesi",
    description: "HTML etiketlerini birlikte kullanmayi ogren",
    icon: "🔧",
    tags: ["<div>", "<span>", "<strong>", "iç içe yapı"],
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "Asagidaki kod kac farkli HTML etiketi icerir? <div><h1>Baslik</h1><p>Paragraf</p></div>",
        code: ["<div><h1>Baslik</h1><p>Paragraf</p></div>"],
        options: ["2", "3", "4", "5"],
        correct: 1,
        hint: "div, h1 ve p etiketlerini sayin.",
        explanation: "3 farkli etiket: div, h1, p."
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "Ic ice etiket yapisi nasil olmali?",
        code: null,
        options: [
          "<p><b>Metin</b></p> (dogru)",
          "<p><b>Metin</p></b> (yanlis)",
          "<b><p>Metin</b></p> (yanlis)",
          "<b><p>Metin</p></b> (dogru)"
        ],
        correct: 0,
        hint: "Ic etiket once kapanmali, dis etiket sonra.",
        explanation: "Ic etiket once kapanir: <p><b>Metin</b></p>"
      },
      {
        id: 3,
        type: "code-fill",
        question: "Baslik ve paragraftan olusan bolumu tamamlayin:",
        template: [
          "&lt;div&gt;",
          "  &lt;h2&gt;Baslik&lt;/h2&gt;",
          "  &lt;____&gt;Bu bir paragraftir.&lt;/p&gt;",
          "&lt;/div&gt;"
        ],
        blanks: ["p"],
        hint: "Paragraf etiketi hangisi?",
        explanation: "Paragraf etiketi <p>'dir."
      },
      {
        id: 4,
        type: "code-fill",
        question: "Liste ve baglanti ic ice kullanimini tamamlayin:",
        template: [
          "&lt;ul&gt;",
          "  &lt;li&gt;&lt;a href=\"#\"&gt;Baglanti&lt;/____&gt;&lt;/li&gt;",
          "&lt;/ul&gt;"
        ],
        blanks: ["a"],
        hint: "Baglanti etiketi nasil kapanir?",
        explanation: "Baglanti etiketi </a> ile kapanir."
      },
      {
        id: 5,
        type: "code-write",
        question: "Baslik, paragraf ve baglanti iceren bir bolum olusturun:",
        requirements: [
          "<div> ile bolum",
          "<h2> ile baslik",
          "<p> ile paragraf",
          "<a> ile baglanti"
        ],
        validation: {
          mustContain: ["<div>", "<h2>", "<p>", "<a href=", "</div>"]
        },
        hint: "Tum etiketleri dogru iceriye yerlestirin.",
        explanation: "Her etiket kendi yerinde ve dogru kapanmali."
      },
      {
        id: 6,
        type: "code-write",
        question: "Baslik, liste ve tabloyu birlestiren sayfa olusturun:",
        requirements: [
          "<h1> ile ana baslik",
          "<hr> ile ayirici cizgi",
          "<ul> ile liste (2 elemanli)",
          "<table> ile tablo (1 baslik + 1 veri satiri)"
        ],
        validation: {
          mustContain: ["<h1>", "<hr>", "<ul>", "<li>", "<table>", "<tr>"]
        },
        hint: "Her etiket kendi alani icinde kullanilmali.",
        explanation: "Sayfa yapisi: baslik → ayirici → liste → tablo."
      },
      {
        id: 7,
        type: "code-fix",
        question: "Asagidaki koddaki ic ice hatalari bulun:",
        code: [
          "<div>",
          "  <h1>Baslik</h1>",
          "  <p>Metin</p>",
          "</div>",
          "<p><div>Ic ice hata</div></p>"
        ],
        errors: [
          {
            line: 5,
            description: "<p> icinde <div> var, bu hatali",
            fix: "<div> icine <p> alinmali"
          }
        ],
        hint: "Block elemanlar (div) inline elemanlarin (p) icine alinamaz.",
        explanation: "<p> icine <div> konulmaz, tersi dogrudur."
      },
      {
        id: 8,
        type: "code-write",
        question: "Hakkimda sayfasi olusturun:",
        requirements: [
          "<h1> ile isim",
          "<hr> ile ayirici",
          "<h2> ile 'Hakkimda' basligi",
          "<p> ile kisa tanim",
          "<h2> ile 'Ilgi Alanlari' basligi",
          "<ul> ile liste (2 eleman)"
        ],
        validation: {
          mustContain: ["<h1>", "<hr>", "<h2>", "<p>", "<ul>", "<li>"]
        },
        hint: "Basliklar, icerik ve liste sirayla gelmeli.",
        explanation: "Sayfa yapisi: baslik → ayirici → bolumler → liste."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Hatali HTML yapısini duzeltin:",
        code: [
          "<html>",
          "<body>",
          "  <h1>Baslik</h1>",
          "  <p>Paragraf</p>",
          "  <p><strong>Vurgulu metin</p></strong>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 5,
            description: "Etiket sirasi hatali: </p> once, </strong> sonra olmali",
            fix: "Ic etiket once kapanmali"
          }
        ],
        hint: "Ic etiket once kapanmali: <p><strong>...</strong></p>",
        explanation: "Dogru yapi: <p><strong>Metin</strong></p>"
      },
      {
        id: 10,
        type: "code-write",
        question: "Tam bir HTML sayfasi olusturun (temel yapi + baslik + icerik):",
        requirements: [
          "<!DOCTYPE html>",
          "<html> ve </html>",
          "<head> icinde <title>",
          "<body> icinde <h1>, <hr>, <p>"
        ],
        validation: {
          mustContain: ["<!DOCTYPE html>", "<html>", "</html>", "<head>", "<body>", "<title>", "<h1>", "<hr>", "<p>"]
        },
        hint: "Tum ogrendigin etiketleri bir arada kullan.",
        explanation: "Tam sayfa: yapı → baslık → icerik."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "Farkli HTML etiketlerini birlikte kullanabilmeyi",
        "Dogru ic ice etiket yapısını (hiyerarsiyi) olusturmayi",
        "Etiketler arasi mantiksal iliski kurmayi",
        "Bir sayfa bolumunu <div> ile gruplamayi",
        "Menu, liste ve baglanti yapilarini birlestirmeyi"
      ]
    }
  },

  // ==========================================
  // SEVİYE 9: "Hata Avcısı"
  // Yaygin HTML hatalari
  // ==========================================
  {
    id: 9,
    name: "Hata Avcisi",
    description: "Yaygin HTML hatalarini tespit etmeyi ogren",
    icon: "🔍",
    tags: ["hata bulma", "dogru yapi", "ic ice kurallar"],
    questions: [
      {
        id: 1,
        type: "code-fix",
        question: "Asagidaki kodda kac eksik kapanis etiketi var?",
        code: [
          "<div>",
          "  <h1>Baslik</h1>",
          "  <p>Paragraf 1",
          "  <p>Paragraf 2</p>",
          "  <ul>",
          "    <li>Madde 1</li>",
          "    <li>Madde 2</li>",
          "</div>"
        ],
        errors: [
          {
            line: 3,
            description: "3. satirda </p> eksik",
            fix: "</p> eklenmeli"
          },
          {
            line: 7,
            description: "</ul> eksik",
            fix: "</ul> eklenmeli"
          }
        ],
        hint: "Her acilan etiket kapanmali.",
        explanation: "Eksik kapanis etiketleri: </p> ve </ul>."
      },
      {
        id: 2,
        type: "code-fix",
        question: "Hatali baglanti kodunu duzeltin:",
        code: [
          "<a href=\"https://google.com\">Google</a>",
          "<a href>Baglanti Eksik</a>",
          "<a>Link</a>"
        ],
        errors: [
          {
            line: 2,
            description: "href degeri bos",
            fix: "URL eklenmeli"
          },
          {
            line: 3,
            description: "href onniteligi tamamen eksik",
            fix: "href eklenmeli"
          }
        ],
        hint: "Her <a> etiketinde href onniteligi olmali.",
        explanation: "Her baglantida href onniteligi zorunludur."
      },
      {
        id: 3,
        type: "code-fix",
        question: "img etiketindeki hatalari bulun:",
        code: [
          "<img src=\"foto.jpg\">",
          "<img src=\"kedi.jpg\" alt=\"Kedi\">",
          "<img alt=\"Gorsel\">"
        ],
        errors: [
          {
            line: 1,
            description: "1. img'de alt eksik",
            fix: "alt eklenmeli"
          },
          {
            line: 3,
            description: "3. img'de src eksik",
            fix: "src eklenmeli"
          }
        ],
        hint: "Her <img>'de hem src hem alt olmali.",
        explanation: "Her <img>'de hem src hem de alt zorunludur."
      },
      {
        id: 4,
        type: "code-fix",
        question: "Tablo yapisindaki hatalari bulun:",
        code: [
          "<table>",
          "  <td>Isim</td>",
          "  <td>Yas</td>",
          "  <tr>",
          "    <td>Ali</td>",
          "    <td>20</td>",
          "  </tr>",
          "</table>"
        ],
        errors: [
          {
            line: 2,
            description: "td'ler <tr> icinde degil",
            fix: "td'ler bir <tr>'ye alinmali"
          },
          {
            line: 3,
            description: "Baslik hucreleri th olmali",
            fix: "td yerine th kullanilmali"
          }
        ],
        hint: "Baslik hucreleri <tr> icinde <th> ile tanimlanmali.",
        explanation: "Dogru yapi: <tr><th>Baslik</th></tr> seklinde olmali."
      },
      {
        id: 5,
        type: "code-fix",
        question: "Ic ice etiket hatalarini bulun:",
        code: [
          "<p><strong>Metin</strong></p>",
          "<p><em>Italic</p></em>",
          "<div><span>Metin</div></span>"
        ],
        errors: [
          {
            line: 2,
            description: "Etiket sirasi hatali",
            fix: "</em> once, </p> sonra olmali"
          },
          {
            line: 3,
            description: "Etiket sirasi hatali",
            fix: "</span> once, </div> sonra olmali"
          }
        ],
        hint: "Ic etiket once kapanmali.",
        explanation: "Ic etiket once kapanir: <p><em>...</em></p>"
      },
      {
        id: 6,
        type: "code-fix",
        question: "Tum hatalari bulup duzeltin:",
        code: [
          "<!DOCTYPE html>",
          "<html>",
          "<head><title>Sayfa</title></head>",
          "<body>",
          "  <h1>Başlik</h1>",
          "  <h1>Baska Baslik</h1>",
          "  <h3>h2 Atlandi</h3>",
          "  <p>Paragraf</p>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 5,
            description: "Iki tane h1 var",
            fix: "Ikinci h1 yerine h2 kullanilmali"
          },
          {
            line: 7,
            description: "h2 atlanmis",
            fix: "h3 yerine h2 kullanilmali"
          }
        ],
        hint: "Bir sayfada tek h1 olmali ve basliklar sirayla gitmeli.",
        explanation: "Tek h1, ardindan h2 → h3 siralamasi dogrudur."
      },
      {
        id: 7,
        type: "code-write",
        question: "Hatali koddaki sorunlari aciklayarak dogru versiyonu yazin:",
        requirements: [
          "Eksik kapanis etiketlerini duzeltin",
          "img'ye alt ekleyin",
          "Basliklari siralayin (h1 → h2 → h3)"
        ],
        validation: {
          mustContain: ["</p>", "</li>", "alt="]
        },
        hint: "Her acilan etiket kapanmali, img'de alt olmali.",
        explanation: "Dogru HTML: etiketler kapanmali, img'de alt olmali."
      },
      {
        id: 8,
        type: "code-write",
        question: "Kusursuz bir HTML sayfasi olusturun:",
        requirements: [
          "<!DOCTYPE html> baslamali",
          "Tek <h1> olmali",
          "Basliklar sirayla gitmeli (h1 → h2)",
          "Tum etiketler kapanmali",
          "<img>'de alt onniteligi olmali"
        ],
        validation: {
          mustContain: ["<!DOCTYPE html>", "<html>", "</html>", "<head>", "<body>"]
        },
        hint: "Tum kurallara dikkat edin.",
        explanation: "Kusursuz HTML: dogru yapi, sirali basliklar, acik etiketler."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Asagidaki kodu tamamen duzeltin:",
        code: [
          "<html>",
          "<head><title>Sayfa</title>",
          "<body>",
          "  <h1>Başlik</h1>",
          "  <h1>Baska Baslik</h1>",
          "  <p>Paragraf<p>",
          "  <img src=\"resim.jpg\">",
          "  <ul>",
          "    <li>Madde 1",
          "    <li>Madde 2</li>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 2,
            description: "</head> eksik",
            fix: "</head> eklenmeli"
          },
          {
            line: 5,
            description: "Iki tane h1",
            fix: "Ikinci h1 h2 olmali"
          },
          {
            line: 6,
            description: "</p> eksik",
            fix: "</p> eklenmeli"
          },
          {
            line: 7,
            description: "img'de alt eksik",
            fix: "alt eklenmeli"
          },
          {
            line: 9,
            description: "1. li'de </li> eksik",
            fix: "</li> eklenmeli"
          }
        ],
        hint: "Her acilan etiket kapanmali, basliklar sirayla gitmeli.",
        explanation: "Cok sayida hata: eksik kapanis, kopya baslik, eksik alt."
      },
      {
        id: 10,
        type: "code-write",
        question: "Hatalardan arinmis ornek bir web sayfasi yazin:",
        requirements: [
          "Temel HTML yapisi (DOCTYPE, html, head, body)",
          "<title> etiketi",
          "Tek <h1>",
          "h2 alt basliklar",
          "<p> paragraflar",
          "<ul> liste",
          "<img> gorsel (alt ile)",
          "Tum etiketler kapanmali"
        ],
        validation: {
          mustContain: ["<!DOCTYPE html>", "<html>", "</html>", "<head>", "<body>", "<title>"]
        },
        hint: "Tum ogrendigin kurallari uygula.",
        explanation: "Kusursuz sayfa: dogru yapi, tek h1, sirali basliklar, acik etiketler."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "Yaygin HTML hatalarini hizlica tespit edebilmeyi",
        "Eksik kapanis etiketi sorunlarini bulabilmeyi",
        "Self-closing etiketlerin dogru kullanimini",
        "Ic ice etiket siralamasi hatalarini duzeltebilmeyi",
        "Eksik onnitelik sorunlarini tanuyabilmeyi"
      ]
    }
  },

  // ==========================================
  // SEVİYE 10: "Ustalık Sınavı"
  // Kapsamli test - tum konular
  // ==========================================
  {
    id: 10,
    name: "Ustalik Sinaavi",
    description: "Tum ogrendiklerini test et",
    icon: "🏆",
    tags: ["tum konular", "kapsamli test"],
    questions: [
      {
        id: 1,
        type: "code-fix",
        question: "Asagidaki HTML kodunda tum hatalari bulun:",
        code: [
          "<!DOCTYPE html>",
          "<html>",
          "<head><title>Sayfa</title>",
          "<body>",
          "  <h1>Baslik</h1>",
          "  <h3>h2 Atlandi</h3>",
          "  <p>Paragraf<p>",
          "  <img src=\"foto.jpg\">",
          "  <a>Link</a>",
          "  <ul>",
          "    <li>Madde 1",
          "    <li>Madde 2</li>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 3,
            description: "</head> eksik",
            fix: "</head> eklenmeli"
          },
          {
            line: 6,
            description: "h2 atlanmis",
            fix: "h3 yerine h2 kullanilmali"
          },
          {
            line: 7,
            description: "</p> eksik",
            fix: "</p> eklenmeli"
          },
          {
            line: 8,
            description: "img'de alt eksik",
            fix: "alt eklenmeli"
          },
          {
            line: 9,
            description: "a'da href eksik",
            fix: "href eklenmeli"
          },
          {
            line: 11,
            description: "</li> eksik",
            fix: "</li> eklenmeli"
          },
          {
            line: 12,
            description: "</ul> eksik",
            fix: "</ul> eklenmeli"
          }
        ],
        hint: "Her acilan etiket kapanmali, basliklar sirayla gitmeli, img'de alt olmali.",
        explanation: "7 farkli hata: eksik kapanis, atlanan baslik, eksik onnitelik."
      },
      {
        id: 2,
        type: "code-write",
        question: "Tam bir web sayfasi olusturun (baslik, paragraf, gorsel, baglanti, liste, tablo):",
        requirements: [
          "<!DOCTYPE html> ile baslamali",
          "<head> icinde <title>",
          "<h1> ile ana baslik",
          "<p> ile paragraf",
          "<img> ile gorsel (src ve alt ile)",
          "<a> ile baglanti (href ile)",
          "<ul> ile liste (en az 2 <li>)",
          "<table> ile tablo (en az 1 baslik + 1 veri satiri)"
        ],
        validation: {
          mustContain: [
            "<!DOCTYPE html>",
            "<html>",
            "</html>",
            "<head>",
            "<body>",
            "<title>",
            "<h1>",
            "<p>",
            "<img",
            "<a href=",
            "<ul>",
            "<li>",
            "<table>",
            "<tr>"
          ]
        },
        hint: "Tum etiketleri dogru yere ve dogru sirayla yerlestirin.",
        explanation: "Kapsamli sayfa: tum ogrenilen etiketleri bir arada kullanma."
      },
      {
        id: 3,
        type: "code-fix",
        question: "Tablo ve listeyi iceren koddaki hatalari bulun:",
        code: [
          "<h1>Urunler</h1>",
          "<ul>",
          "  <li>Urun 1</li>",
          "  <li>Urun 2</li>",
          "</ul>",
          "<table>",
          "  <tr>",
          "    <th>Urun</th>",
          "    <th>Fiyat</th>",
          "  </tr>",
          "  <tr>",
          "    <td>Kitap</td>",
          "    <td>50 TL</td>",
          "  </tr>",
          "</table>"
        ],
        errors: [],
        hint: "Kodu inceleyin, hata var mi?",
        explanation: "Bu kod dogru! Tum etiketler kapanmis ve dogru kullanilmis."
      },
      {
        id: 4,
        type: "code-write",
        question: "Hakkinda sayfasi olusturun:",
        requirements: [
          "<h1> ile isim",
          "<hr> ile ayirici",
          "<h2> ile 'Hakkimda'",
          "<p> ile tanim",
          "<h2> ile 'Ilgi Alanlari'",
          "<ul> ile liste (2 eleman)",
          "<h2> ile 'Iletisim'",
          "<a> ile e-posta baglantisi",
          "<img> ile profil gorseli"
        ],
        validation: {
          mustContain: ["<h1>", "<hr>", "<h2>", "<p>", "<ul>", "<li>", "<a href=", "<img"]
        },
        hint: "Her bolum kendi basligiyla baslamali.",
        explanation: "Tam sayfa: baslik → ayirici → bolumler → iletisim."
      },
      {
        id: 5,
        type: "code-fix",
        question: "Ic ice liste ve baglanti iceren koddaki hatalari bulun:",
        code: [
          "<ul>",
          "  <li><a href=\"https://google.com\">Google</a></li>",
          "  <li><a href=\"https://ornek.com\">Ornek</a></li>",
          "  <li><a>Baglantisiz</a></li>",
          "</ul>"
        ],
        errors: [
          {
            line: 4,
            description: "3. baglantida href eksik",
            fix: "href eklenmeli"
          }
        ],
        hint: "Her <a> etiketinde href olmali.",
        explanation: "Her baglantida href onniteligi zorunludur."
      },
      {
        id: 6,
        type: "code-write",
        question: "Yemek menu sayfasi olusturun:",
        requirements: [
          "<h1> ile 'Yemek Menusu'",
          "<hr> ile ayirici",
          "<h2> ile 'Ana Yemekler'",
          "2 tane <h3> ile yemek adlari",
          "<h2> ile 'Tatlilar'",
          "1 tane <h3> ile tatli adi",
          "<table> ile fiyat tablosu (1 baslik + 2 veri satiri)"
        ],
        validation: {
          mustContain: ["<h1>", "<hr>", "<h2>", "<h3>", "<table>", "<tr>", "<th>", "<td>"]
        },
        hint: "Menunun her bolumunu ayri basliklarla olusturun.",
        explanation: "Menü yapisi: baslik → kategoriler → tablo."
      },
      {
        id: 7,
        type: "code-fix",
        question: "Tum hatalari bulup duzeltin:",
        code: [
          "<html>",
          "<head><title>Test</title>",
          "<body>",
          "  <h1>Baslik</h1>",
          "  <img src=\"resim.jpg\">",
          "  <a>Baglanti</a>",
          "  <ul>",
          "    <li>Madde 1</li>",
          "</body>",
          "</html>"
        ],
        errors: [
          {
            line: 2,
            description: "</head> eksik",
            fix: "</head> eklenmeli"
          },
          {
            line: 5,
            description: "img'de alt eksik",
            fix: "alt eklenmeli"
          },
          {
            line: 6,
            description: "a'da href eksik",
            fix: "href eklenmeli"
          },
          {
            line: 7,
            description: "</ul> eksik",
            fix: "</ul> eklenmeli"
          }
        ],
        hint: "Her acilan etiket kapanmali, img'de alt, a'da href olmali.",
        explanation: "4 hata: eksik kapanis, eksik onnitelik."
      },
      {
        id: 8,
        type: "code-write",
        question: "Kutuphanesi sayfasi olusturun:",
        requirements: [
          "<!DOCTYPE html> baslangic",
          "<head> icinde <title>",
          "<h1> ile 'Kutuphanesi'",
          "<hr>",
          "<h2> ile 'Kitap Kategorileri'",
          "<ol> ile sirali liste (3 kategori)",
          "<h2> ile 'Populer Kitaplar'",
          "<table> ile kitap tablosu (3 sutunlu: Ad, Yazar, Sayfa - 2 veri satiri)",
          "<h2> ile 'Uyelik Formu'",
          "<form> icinde input ve button"
        ],
        validation: {
          mustContain: [
            "<!DOCTYPE html>",
            "<html>",
            "</html>",
            "<head>",
            "<body>",
            "<title>",
            "<h1>",
            "<hr>",
            "<h2>",
            "<ol>",
            "<li>",
            "<table>",
            "<tr>",
            "<th>",
            "<td>",
            "<form>",
            "<input",
            "<button"
          ]
        },
        hint: "Tum ogrendigin etiketleri bir sayfada kullan.",
        explanation: "Kapsamli sayfa: tum etiket turlerini icerir."
      },
      {
        id: 9,
        type: "code-fix",
        question: "Tablo, form ve gorsel iceren koddaki hatalari bulun:",
        code: [
          "<h1>Urun Ekle</h1>",
          "<form>",
          "  <label>Urun Adi:</label>",
          "  <input type=\"text\">",
          "  <button>Gonder</button>",
          "</form>",
          "<table>",
          "  <tr>",
          "    <td>Urun</td>",
          "    <td>Fiyat</td>",
          "  </tr>",
          "  <tr>",
          "    <td>Kitap</td>",
          "    <td>50</td>",
          "  </tr>",
          "</table>",
          "<img src=\"logo.jpg\">"
        ],
        errors: [
          {
            line: 3,
            description: "label'da for onniteligi eksik",
            fix: "for eklenmeli"
          },
          {
            line: 4,
            description: "input'da id eksik",
            fix: "id eklenmeli"
          },
          {
            line: 9,
            description: "td'ler baslik olmali, th kullanilmali",
            fix: "td yerine th kullanilmali"
          },
          {
            line: 17,
            description: "img'de alt eksik",
            fix: "alt eklenmeli"
          }
        ],
        hint: "label-for eslesmesi, th/td farki, img'de alt.",
        explanation: "4 hata: eksik for, eksik id, yanlis th/td, eksik alt."
      },
      {
        id: 10,
        type: "code-write",
        question: "Kisisel web sayfasi olusturun (tum bilgileri birlestirin):",
        requirements: [
          "<!DOCTYPE html>",
          "<html> + <head> + <title>",
          "<h1> ile isim",
          "<hr>",
          "<p> ile tanim",
          "<h2> + <ul> ile ilgi alanlari",
          "<h2> + <table> ile yetenekler",
          "<h2> + <form> ile iletisim formu",
          "<img> ile profil gorseli",
          "<a> ile sosyal medya baglantisi",
          "Tum etiketler kapanmali"
        ],
        validation: {
          mustContain: [
            "<!DOCTYPE html>",
            "<html>",
            "</html>",
            "<head>",
            "<body>",
            "<title>",
            "<h1>",
            "<hr>",
            "<p>",
            "<h2>",
            "<ul>",
            "<li>",
            "<table>",
            "<tr>",
            "<form>",
            "<input",
            "<button",
            "<img",
            "<a href="
          ]
        },
        hint: "Tum ogrendigin her seyi bir sayfada kullan.",
        explanation: "Final sayfasi: tum HTML bilgisini birlestirme."
      }
    ],
    summary: {
      title: "Ne Öğrendin?",
      items: [
        "Tum HTML etiketlerini kapsamli ve dogru kullanabilmeyi",
        "Karmasik sayfa yapilarini bagimsiz olarak olusturabilmeyi",
        "Gercek dunya web sayfasi gereksinimlerini HTML'e donusturebilmeyi",
        "Hatali kodlari hizlica tespit edip duzeltebilmeyi",
        "HTML'in temel yapisi, semantic yapisi ve erisilebilirlik ilkelerini kavramis olmayi"
      ]
    }
  }
];
