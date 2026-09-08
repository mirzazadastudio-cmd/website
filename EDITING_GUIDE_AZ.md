# Mirzazada Studio — Admin istifadəsi

## İlk giriş
1. Saytın yuxarı hissəsində **Admin** seçin.
2. **ChatGPT ilə sahib hesabını təsdiqlə** düyməsini basın və saytın sahibi olduğunuz hesabla daxil olun.
3. **Hesab və parol** bölməsində öz istifadəçi adınızı və ən azı 12 simvolluq parolunuzu təyin edin.
4. Sonrakı girişlərdə bu istifadəçi adı və paroldan istifadə edin. Parolu unutsanız, sahib ChatGPT hesabı ilə daxil olub yeniləyə bilərsiniz.

Parolu söhbətdə paylaşmayın. Hesab yalnız sahibin təsdiqindən sonra yaradılır.
Yerli baxışın test hesabı onlayn hesaba köçürülmür. Onlayn versiya yayımlandıqdan sonra hesabınızı orada təyin edin.

## Layihələr
- **+ Yeni layihə**: ad, ünvan (slug), kateqoriya, növ və təsvir yazın.
- **+ Render yüklə**: JPG, PNG və WebP qəbul olunur; hər orijinal fayl ən çox 20 MB.
- Ən azı bir render əlavə edin.
- **Örtük**: portfolio kartının şəkli.
- **Ana lent**: hərəkət edən ana səhifə kartının şəkli.
- **← / →**: qalereyada render sırasını dəyişir.
- **Çıxar**: şəkli qalereyadan çıxarır; yüklənmiş faylı yaddaşdan silmir.
- **Alt hissədən kəs (%)**: şəkilin görünən alt zolağını kadrdan çıxarır. Orijinal fayl qorunur. Eyni kəsim saytda və böyüdülmüş qalereyada tətbiq olunur.
- **Ana səhifədə göstər**: layihəni hərəkətli lentə əlavə edir.
- **Arxivlə**: təsdiqdən sonra layihəni açıq saytdan gizlədir. Arxiv filtrindən qaralama kimi bərpa edin.
- **Dəyişiklikləri saxla**: bütün düzəlişləri sayta tətbiq edir. Saytı yeniləyəndə görünür; yenidən kod yayımlamaq tələb olunmur.

Layihə ünvanı dəyişəndə köhnə link yayımlanmış layihənin yeni ünvanına avtomatik yönləndirilir.
Başqa pəncərədə yeni dəyişiklik saxlanıbsa, köhnə pəncərə onu əvəz etmir; yenidən yükləmək tələb olunur.

## Ana səhifə
Başlıq, giriş mətni, Studio şəkli, xidmət təsvirləri və şəkilləri, əlaqələr və animasiya sürəti bu bölmədə dəyişir.
Hərəkətli layihə siyahısındakı yuxarı/aşağı düymələr sıralamanı dəyişir.
E-poçt və sosial hesabları yazdıqdan sonra **Həqiqi əlaqələr aktivdir** rejimini açın.
Əlaqə forması müraciəti serverdə yoxlayır və admin müraciət qutusunda saxlayır. Poçt xidməti qurulanadək e-poçt bildirişi göndərilmir.

## Yaddaş və yayımlama
Layihə məlumatları və hesab D1 bazasında, yüklənən şəkillər R2 yaddaşında saxlanır.
Kod faylları (`lib/projects.ts`, `lib/site-config.ts`) ilkin məzmundur. Admin ilk saxlamadan sonra bazadakı məzmun əsas olur.
Kod/dizayn dəyişiklikləri ayrıca yayımlanır. Admin məzmun dəyişiklikləri isə “Dəyişiklikləri saxla” ilə dərhal qüvvəyə minir.



## Genişləndirilmiş kolleksiya

Kolleksiyada 31 ayrı layihə və 149 render var. PDF-də adı yazılmayan layihələr üçün təsviri adlar seçilib; rəsmi adları Admin → Layihələr bölməsində dəyişə bilərsiniz.

- Əsas kateqoriyanı seçin, “Əlavə kateqoriyalar” düymələri ilə layihəni başqa uyğun filtrlərə də daxil edin. Eyni layihə “All projects” siyahısında bir dəfə görünür.
- “All projects sırası” bölməsində “Əvvələ çək” və “Sona çək” ilə ümumi sıralamanı dəyişin. Böyük kompleksləri əvvəldə saxlayın və iki sütunda yanaşı düşən örtüklərin rəng tonlarını müqayisə edin.
- Hərəkətli lentin sırası ayrıca Ana səhifə bölməsində idarə olunur. İlkin sıralama iri yaşayış komplekslərindən kiçik məkanlara və məhsul modellərinə doğru gedir.
- 491 Central Avenue layihəsinin eksteryer və interyer renderləri bir səhifədə birləşdirilib. Köhnə interyer ünvanı həmin səhifəyə yönləndirilir.
- Gecə görünüşləri aid olduqları layihələrə əlavə edilib. Eyni layihənin başqa qovluqdakı surəti ayrıca layihə sayılmır.

## Kateqoriya səhifələri

Saytda 8 kateqoriya var: Residential, Large Buildings, Restoration, Outdoor Systems, Street, Exterior, Interior və Product & Technical.

- **Kateqoriyalar** bölməsində hər kateqoriyanın əsas layihəsini, giriş mətnini və iş növlərini dəyişin. Əsas layihə həmin kateqoriyaya aid olmalıdır.
- Əsas layihə kateqoriya səhifəsinin əvvəlində göstərilir. Qalan layihələr ümumi siyahıdakı sıralamanı izləyir.
- **Layihələr → Sistem və görünüş növləri**: Pergolas, Bioclimatic roofs, Glass systems, Exterior views, Interior views, Assembly & cutaways. Seçdikləriniz kateqoriya səhifəsində əlavə filtrlər yaradır.
- Ana səhifənin dörd kateqoriya kartı uyğun bölməni açır. Layihə kartları və hərəkətli lent isə birbaşa layihənin render qalereyasına aparır.
- Layihə ünvanını dəyişdikdə onun kateqoriya və blog bağlantıları birlikdə yenilənir. Layihə çıxarılsa, ona bağlı əsas seçim avtomatik boşaldılır.

## Haqqımda

**Haqqımda** bölməsində portreti yükləyin, adınızı, peşə başlığını, təcrübəni, bioqrafiyanı, təhsili və əməkdaşlıq mətnini dəyişin. Portret həm About səhifəsində, həm də Contact bölməsində göstərilir. İlkin bioqrafiya LinkedIn və Twine profilinizdəki məlumatlardan hazırlanıb; dəqiq başlanğıc ili və təsdiqlənməyən şirkət siyahısı əlavə edilməyib.

## Blog və rəylər

- **Blog → Yeni yazı** ilə başlıq, qısa təsvir, mətn, tarix və örtük seçin. İstəsəniz, ayrıca örtük yükləyin və yazını bir layihəyə bağlayın.
- Mətnin abzaslarını boş sətirlə ayırın. Yazıları siyahıdakı ardıcıllıqla göstəririk; ana səhifədə ilk üç yayımlanmış yazı görünür.
- Yeni yazı qaralama olaraq başlayır. **Saytda göstər** seçib dəyişiklikləri saxladıqdan sonra görünəcək. Qaralama mətnləri açıq səhifələrə göndərilmir.
- **Rəylər** bölməsində müştəri rəyi əlavə edin. Hazır rəylər nümunədir və açıq saytda gizlədilir. Həqiqi müştəridən aldığınız mətnlə dəyişəndən sonra **Müştəridən alınmış həqiqi rəy** seçin.
- Rəyləri gizlətmək və ya siyahıdan çıxarmaq mümkündür. Açıq rəy göndərmə forması yoxdur; rəyləri admin əlavə edir.
- Hamısını tətbiq etmək üçün yuxarıdakı **Dəyişiklikləri saxla** düyməsini basın.

## Renderlərin kopyalanmasına qarşı maneələr

İctimai səhifələrdə renderlərin sağ klik menyusu, native sürüklənib masaüstünə aparılması, şəkli əhatə edən seçimin kopyalanması və Ctrl/Cmd+S qısayolu məhdudlaşdırılır. Mobil brauzerlərdə dəstəklənən uzun basma menyusu söndürülür. Çap/PDF görünüşündə renderlər gizlədilir. Layihə lenti, qalereya oxları və əlaqə formunun mətn sahələri işləyir.

Admin panelində bu məhdudiyyətlər tətbiq olunmur. **Layihələr → Renderlər → Yüklə ↓** vasitəsilə həmin render faylını götürə bilərsiniz. Məzmun dəyişdirmək və render yükləmək üçün server yenə admin girişini yoxlayır.

Bunlar adi kopyalama yollarına qarşı brauzer maneələridir, tam surətçıxarma qoruması deyil. İctimai göstərilən şəkil faylları brauzerə çatdırılır; ekran görüntüsü, fayl ünvanı və texniki vasitələrlə götürülməsi mümkündür. Orijinal layihə/model fayllarını ictimai sayt yaddaşına əlavə etməyin.


## Master brief ilə əlavə olunan redaktor

- Layihə statusları: **Qaralama**, **Yayımlanıb**, **Arxiv**. Yeni layihə qaralama başlayır. Status dəyişiklikləri yuxarıdakı saxlama düyməsindən sonra qüvvəyə minir.
- İl, məkan, xidmətlər, müştəri/memar krediti və SEO təsvirini yalnız dəqiq məlumatla doldurun. Məxfi layihə açıq yayımlanmır.
- Örtüyün X/Y fokusunu və zoomunu dəyişmək layihə daxilindəki şəkil nisbətinə təsir etmir.
- **+ Blok** ilə şəkil, 2/3 sütun, başlıq, mətn, video və ölçüsü əvvəlcədən müəyyənləşdirilmiş boşluq əlavə edin. Blokların tutacağından sürüşdürün və ya oxlarla sıralayın.
- Qalereyanı bloklara çevirdikdən sonra yeni renderləri istədiyiniz bloklara seçin. Hər şəkil üçün alt mətn, izah, kredit və fokus ayrıca dəyişir.
- Video üçün YouTube və ya Vimeo ünvanı istifadə edin. Video ziyarətçi Play basanda yüklənir.
- **Əvəz et** şəkli layihədəki mövcud yerlərində yeniləyir. Əvvəlki orijinal arxivdə qalır.
- **Önbaxış** redaktədəki dəyişiklikləri desktop və mobil çərçivədə göstərir. Ayrıca özəl link yalnız saxlanılmış versiyanı göstərir və admin girişi tələb edir.
- Yadda saxlanmamış dəyişiklik varsa səhifədən çıxış xəbərdarlığı verilir. Başqa pəncərədə saxlanmış versiyanı səssizcə əvəz etmək mümkün deyil.

## Orijinal fayllar və bərpa

Yeni yüklənən şəkilin orijinalı özəl arxivdə dəyişmədən saxlanır. Sayt üçün ən çox 640/1280/2400 ölçülərində WebP nüsxələri hazırlanır; kiçik şəkil süni böyüdülmür. Eyni orijinal yenidən yüklənəndə hash ilə tanınır. Ölçü və nisbət yoxlanır. Köhnə portfolio fayllarının hostdakı özəl arxivə idxalı yayıma hazırlıq mərhələsində tamamlanacaq; kompüterdəki orijinallar saxlanılıb.

**Müraciətlər və ehtiyat nüsxələr** bölməsindən son 30 məzmun versiyasını, cari JSON ixracını və yeni yüklənmiş orijinal faylları yükləyin. JSON arxivə şəkil baytlarını daxil etmir; faylları ayrıca saxlayın. JSON-dan bərpa əvvəlcə redaktora yüklənir; yoxlayıb **Dəyişiklikləri saxla** seçin. Müraciətlər və orijinal fayllar bu əməliyyatla əvəz edilmir.

Tam yeni hosta köçərkən mənbə kodu, DB ixracı və orijinal/çatdırılma faylları birlikdə köçürülməlidir. Tək JSON şəkilləri bərpa etmir.

## Müraciətlər və domen

Müraciət qutusunda statusu Yeni/Baxılır/Cavablandı/Bağlandı/Spam dəyişin. Mövcuddursa kampaniya mənbəyi də görünür. Cavab vermək üçün e-poçt ünvanına basmaq öz poçt tətbiqinizi açır; sayt sizin adınızdan avtomatik cavab göndərmir.

Domen: **mirzazadastudio.com**, qeydiyyat provayderi: **domain.com**. E-poçt: **hello@mirzazadastudio.com** — poçt qutusu hələ qurulmayıb. Instagram qoşulub; Behance ünvanı təqdim edilənədək gizlidir. Yeni kodun açıq hosta yayımı və domenin qoşulması ayrıca yekun mərhələdir.
