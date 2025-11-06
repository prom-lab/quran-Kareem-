 // Quran API Integration
        class QuranAPI {
            constructor() {
                this.baseURL = 'https://api.alquran.cloud/v1';
                this.surahs = [];
                this.currentSurah = null;
            }

            async loadSurahs() {
                try {
                    const response = await fetch(`${this.baseURL}/surah`);
                    const data = await response.json();
                    this.surahs = data.data;
                    this.displaySurahsGrid();
                    this.displayAudioSurahs();
                } catch (error) {
                    console.error('Error loading surahs:', error);
                    this.displayError('quran-grid', 'عذراً، حدث خطأ في تحميل سور القرآن');
                }
            }

            displaySurahsGrid() {
                const gridContainer = document.getElementById('quran-grid');
                if (!gridContainer) return;

                gridContainer.innerHTML = '';

                this.surahs.forEach(surah => {
                    const surahCard = document.createElement('div');
                    surahCard.className = 'surah-card';
                    surahCard.setAttribute('data-surah', surah.number);
                    surahCard.innerHTML = `
                        <div class="surah-number">${surah.number}</div>
                        <div class="surah-name">${surah.name}</div>
                        <div class="surah-details">
                            ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - ${surah.numberOfAyahs} آية
                        </div>
                    `;
                    gridContainer.appendChild(surahCard);
                });

                this.setupSurahCards();
            }

            setupSurahCards() {
                const cards = document.querySelectorAll('.surah-card');
                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        const surahNumber = card.getAttribute('data-surah');
                        this.loadSurahContent(surahNumber);
                    });
                });
            }

            async loadSurahContent(surahNumber) {
                try {
                    // إزالة النشاط من جميع البطاقات
                    document.querySelectorAll('.surah-card').forEach(card => {
                        card.classList.remove('active');
                    });
                    
                    // إضافة النشاط للبطاقة المحددة
                    const selectedCard = document.querySelector(`.surah-card[data-surah="${surahNumber}"]`);
                    if (selectedCard) {
                        selectedCard.classList.add('active');
                    }

                    const response = await fetch(`${this.baseURL}/surah/${surahNumber}/ar.alafasy`);
                    const data = await response.json();
                    
                    if (data.code === 200 && data.data) {
                        this.currentSurah = data.data;
                        this.displaySurahContent();
                    }
                } catch (error) {
                    console.error('Error loading surah content:', error);
                    alert('عذراً، حدث خطأ في تحميل محتوى السورة');
                }
            }

            displaySurahContent() {
                const contentContainer = document.getElementById('surah-content');
                if (!contentContainer || !this.currentSurah) return;

                let versesHTML = '';
                this.currentSurah.ayahs.forEach(ayah => {
                    versesHTML += `
                        <div class="verse">
                            <span class="verse-text">${ayah.text}</span>
                            <span class="verse-number">${ayah.numberInSurah}</span>
                        </div>
                    `;
                });

                contentContainer.innerHTML = `
                    <div class="surah-header">
                        <h3>سورة ${this.currentSurah.englishName} (${this.currentSurah.name})</h3>
                        <div class="surah-info">
                            ${this.currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - 
                            ${this.currentSurah.numberOfAyahs} آية
                        </div>
                    </div>
                    <div class="verses-container">
                        ${versesHTML}
                    </div>
                `;

                contentContainer.classList.add('active');
                
                // التمرير إلى محتوى السورة
                setTimeout(() => {
                    contentContainer.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }

            displayAudioSurahs() {
                const gridContainer = document.getElementById('audio-surahs-grid');
                if (!gridContainer) return;

                gridContainer.innerHTML = '';

                this.surahs.forEach(surah => {
                    const surahCard = document.createElement('div');
                    surahCard.className = 'surah-card audio-surah';
                    surahCard.setAttribute('data-surah', surah.number);
                    surahCard.innerHTML = `
                        <div class="surah-number">${surah.number}</div>
                        <div class="surah-name">${surah.name}</div>
                        <div class="surah-details">
                            ${surah.numberOfAyahs} آية
                        </div>
                    `;
                    gridContainer.appendChild(surahCard);
                });

                this.setupAudioSurahCards();
            }

            setupAudioSurahCards() {
                const cards = document.querySelectorAll('.audio-surah');
                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        const surahNumber = card.getAttribute('data-surah');
                        if (window.audioManager) {
                            window.audioManager.playSurah(surahNumber);
                        }
                    });
                });
            }

            searchSurahs(query) {
                const resultsContainer = document.getElementById('quran-search-results');
                if (!resultsContainer) return;

                if (!query.trim()) {
                    resultsContainer.classList.remove('active');
                    return;
                }

                const filteredSurahs = this.surahs.filter(surah => 
                    surah.name.includes(query) || 
                    surah.englishName.toLowerCase().includes(query.toLowerCase())
                );

                if (filteredSurahs.length === 0) {
                    resultsContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">لا توجد نتائج</p>';
                } else {
                    resultsContainer.innerHTML = '';
                    filteredSurahs.forEach(surah => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'result-item';
                        resultItem.innerHTML = `
                            <strong>${surah.name}</strong> - ${surah.englishName}
                            <div style="font-size: 0.9rem; color: #666;">
                                ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - ${surah.numberOfAyahs} آية
                            </div>
                        `;
                        resultItem.addEventListener('click', () => {
                            this.loadSurahContent(surah.number);
                            resultsContainer.classList.remove('active');
                            document.getElementById('quran-search').value = '';
                        });
                        resultsContainer.appendChild(resultItem);
                    });
                }

                resultsContainer.classList.add('active');
            }

            displayError(containerId, message) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `<p style="text-align: center; color: red; padding: 2rem;">${message}</p>`;
                }
            }
        }

        // Audio Quran Manager
        class AudioQuranManager {
            constructor() {
                this.reciters = [];
                this.currentAudio = null;
            }

            async init() {
                await this.loadReciters();
                this.setupAudioControls();
            }

            async loadReciters() {
                try {
                    // قائمة القراء من موقع mp3quran.net
                    this.reciters = [
                        { id: '1', name: 'مشاري العفاسي', baseUrl: 'https://server8.mp3quran.net/afs' },
                        { id: '2', name: 'محمود خليل الحصري', baseUrl: 'https://server8.mp3quran.net/husary' },
                        { id: '3', name: 'عبد الباسط عبد الصمد', baseUrl: 'https://server8.mp3quran.net/abdulbasit' },
                        { id: '4', name: 'محمد صديق المنشاوي', baseUrl: 'https://server8.mp3quran.net/minshawi' },
                        { id: '5', name: 'سعود الشريم', baseUrl: 'https://server8.mp3quran.net/shuraym' }
                    ];

                    this.populateReciterSelect();
                } catch (error) {
                    console.error('Error loading reciters:', error);
                }
            }

            populateReciterSelect() {
                const select = document.getElementById('reciter-select');
                if (!select) return;

                select.innerHTML = '<option value="">اختر القارئ...</option>';
                this.reciters.forEach(reciter => {
                    const option = document.createElement('option');
                    option.value = reciter.id;
                    option.textContent = reciter.name;
                    select.appendChild(option);
                });
            }

            async playSurah(surahNumber) {
                const reciterSelect = document.getElementById('reciter-select');
                const selectedReciterId = reciterSelect.value;
                
                if (!selectedReciterId) {
                    alert('يرجى اختيار قارئ أولاً');
                    reciterSelect.focus();
                    return;
                }

                const surah = window.quranAPI.surahs.find(s => s.number == surahNumber);
                const reciter = this.reciters.find(r => r.id == selectedReciterId);

                if (!surah || !reciter) return;

                try {
                    // بناء رابط السورة بناءً على تنسيق mp3quran.net
                    const surahNum = surahNumber.toString().padStart(3, '0');
                    const audioUrl = `${reciter.baseUrl}/${surahNum}.mp3`;
                    
                    this.currentAudio = document.getElementById('quran-audio');
                    const audioPlayer = document.getElementById('audio-player');
                    const currentSurah = document.getElementById('current-surah');
                    const currentReciter = document.getElementById('current-reciter');

                    if (this.currentAudio && audioPlayer && currentSurah && currentReciter) {
                        // إظهار مشغل الصوت
                        audioPlayer.classList.add('active');
                        
                        // تعيين بيانات السورة والقارئ
                        currentSurah.textContent = `سورة ${surah.name}`;
                        currentReciter.textContent = `القارئ: ${reciter.name}`;
                        
                        // تعيين مصدر الصوت
                        this.currentAudio.src = audioUrl;
                        
                        // تمرير إلى مشغل الصوت
                        setTimeout(() => {
                            audioPlayer.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    }
                } catch (error) {
                    console.error('Error playing surah:', error);
                    alert('عذراً، حدث خطأ في تحميل التلاوة. يرجى المحاولة مرة أخرى.');
                }
            }

            setupAudioControls() {
                const playBtn = document.getElementById('play-btn');
                const pauseBtn = document.getElementById('pause-btn');
                const stopBtn = document.getElementById('stop-btn');
                const downloadBtn = document.getElementById('download-btn');
                const audio = document.getElementById('quran-audio');

                if (playBtn && audio) {
                    playBtn.addEventListener('click', () => {
                        audio.play().catch(error => {
                            console.log('خطأ في التشغيل:', error);
                        });
                    });
                }

                if (pauseBtn && audio) {
                    pauseBtn.addEventListener('click', () => {
                        audio.pause();
                    });
                }

                if (stopBtn && audio) {
                    stopBtn.addEventListener('click', () => {
                        audio.pause();
                        audio.currentTime = 0;
                    });
                }

                if (downloadBtn && audio) {
                    downloadBtn.addEventListener('click', () => {
                        if (audio.src && audio.src !== '') {
                            const link = document.createElement('a');
                            link.href = audio.src;
                            const surahName = document.getElementById('current-surah').textContent.replace('سورة ', '');
                            const reciterName = document.getElementById('current-reciter').textContent.replace('القارئ: ', '');
                            link.download = `سورة ${surahName} - ${reciterName}.mp3`;
                            link.click();
                        } else {
                            alert('لا يوجد ملف صوتي للتحميل');
                        }
                    });
                }
            }
        }

        // Prayer Times Manager
        class PrayerTimesManager {
            constructor() {
                this.countries = [];
                this.currentLocation = null;
            }

            async init() {
                await this.loadCountries();
                this.setupLocationSelector();
                this.loadPrayerTimes('SA'); // Default to Saudi Arabia
            }

            async loadCountries() {
                try {
                    // قائمة الدول من الموقع
                    this.countries = [
                        { name: 'المملكة العربية السعودية', code: 'SA', city: 'مكة' },
                        { name: 'مصر', code: 'EG', city: 'القاهرة' },
                        { name: 'الإمارات العربية المتحدة', code: 'AE', city: 'دبي' },
                        { name: 'الأردن', code: 'JO', city: 'عمان' },
                        { name: 'الكويت', code: 'KW', city: 'الكويت' },
                        { name: 'قطر', code: 'QA', city: 'الدوحة' },
                        { name: 'عمان', code: 'OM', city: 'مسقط' },
                        { name: 'البحرين', code: 'BH', city: 'المنامة' },
                        { name: 'العراق', code: 'IQ', city: 'بغداد' },
                        { name: 'فلسطين', code: 'PS', city: 'القدس' }
                    ];

                    this.populateLocationSelect();
                } catch (error) {
                    console.error('Error loading countries:', error);
                }
            }

            populateLocationSelect() {
                const select = document.getElementById('prayer-location');
                if (!select) return;

                select.innerHTML = '<option value="">اختر الدولة...</option>';
                this.countries.forEach(country => {
                    const option = document.createElement('option');
                    option.value = country.code;
                    option.textContent = country.name;
                    select.appendChild(option);
                });

                select.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.loadPrayerTimes(e.target.value);
                    }
                });
            }

            setupLocationSelector() {
                // This method is now properly defined
                console.log('Location selector setup complete');
            }

            async loadPrayerTimes(countryCode) {
                try {
                    const prayerTimes = this.getPrayerTimesByCountry(countryCode);
                    this.displayPrayerTimes(prayerTimes);
                } catch (error) {
                    console.error('Error loading prayer times:', error);
                    this.displayError('prayer-times', 'عذراً، حدث خطأ في تحميل مواقيت الصلاة');
                }
            }

            getPrayerTimesByCountry(countryCode) {
                // بيانات مواقيت الصلاة (بيانات افتراضية)
                const prayerTimesData = {
                    'SA': { Fajr: '4:30 ص', Dhuhr: '12:15 م', Asr: '3:45 م', Maghrib: '6:30 م', Isha: '8:00 م' },
                    'EG': { Fajr: '4:00 ص', Dhuhr: '12:00 م', Asr: '3:30 م', Maghrib: '6:15 م', Isha: '7:45 م' },
                    'AE': { Fajr: '4:45 ص', Dhuhr: '12:30 م', Asr: '4:00 م', Maghrib: '6:45 م', Isha: '8:15 م' },
                    'JO': { Fajr: '4:15 ص', Dhuhr: '12:20 م', Asr: '3:40 م', Maghrib: '6:25 م', Isha: '7:55 م' },
                    'KW': { Fajr: '4:25 ص', Dhuhr: '12:10 م', Asr: '3:35 م', Maghrib: '6:20 م', Isha: '7:50 م' },
                    'QA': { Fajr: '4:20 ص', Dhuhr: '12:05 م', Asr: '3:30 م', Maghrib: '6:15 م', Isha: '7:45 م' },
                    'OM': { Fajr: '4:35 ص', Dhuhr: '12:25 م', Asr: '3:50 م', Maghrib: '6:35 م', Isha: '8:05 م' },
                    'BH': { Fajr: '4:15 ص', Dhuhr: '12:15 م', Asr: '3:40 م', Maghrib: '6:25 م', Isha: '7:55 م' },
                    'IQ': { Fajr: '4:10 ص', Dhuhr: '12:15 م', Asr: '3:45 م', Maghrib: '6:30 م', Isha: '8:00 م' },
                    'PS': { Fajr: '4:05 ص', Dhuhr: '12:10 م', Asr: '3:35 م', Maghrib: '6:20 م', Isha: '7:50 م' }
                };

                return prayerTimesData[countryCode] || prayerTimesData['SA'];
            }

            displayPrayerTimes(times) {
                const container = document.getElementById('prayer-times');
                if (!container) return;

                container.innerHTML = `
                    <div class="prayer-item">
                        <span class="prayer-name">الفجر</span>
                        <span class="prayer-time">${times.Fajr}</span>
                    </div>
                    <div class="prayer-item">
                        <span class="prayer-name">الظهر</span>
                        <span class="prayer-time">${times.Dhuhr}</span>
                    </div>
                    <div class="prayer-item">
                        <span class="prayer-name">العصر</span>
                        <span class="prayer-time">${times.Asr}</span>
                    </div>
                    <div class="prayer-item">
                        <span class="prayer-name">المغرب</span>
                        <span class="prayer-time">${times.Maghrib}</span>
                    </div>
                    <div class="prayer-item">
                        <span class="prayer-name">العشاء</span>
                        <span class="prayer-time">${times.Isha}</span>
                    </div>
                `;
            }

            displayError(containerId, message) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `<p style="text-align: center; color: red; padding: 1rem;">${message}</p>`;
                }
            }
        }

        // Azkar Manager
        class AzkarManager {
            constructor() {
                this.azkar = [];
            }

            async init() {
                await this.loadAzkar();
            }

            async loadAzkar() {
                try {
                    // بيانات الأدعية والأذكار
                    this.azkar = [
                        {
                            text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
                            reference: "من الأذكار اليومية",
                            count: "مائة مرة في اليوم"
                        },
                        {
                            text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
                            reference: "من الأذكار اليومية",
                            count: "مائة مرة في اليوم"
                        },
                        {
                            text: "أَسْتَغْفِرُ اللَّهِ وَأَتُوبُ إِلَيْهِ",
                            reference: "من الأذكار اليومية",
                            count: "مائة مرة في اليوم"
                        },
                        {
                            text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
                            reference: "سيد الاستغفار",
                            count: "مرة واحدة بعد كل صلاة"
                        }
                    ];

                    this.displayAzkar();
                } catch (error) {
                    console.error('Error loading azkar:', error);
                    this.displayError('azkar-list', 'عذراً، حدث خطأ في تحميل الأدعية والأذكار');
                }
            }

            displayAzkar() {
                const container = document.getElementById('azkar-list');
                if (!container) return;

                container.innerHTML = '';

                this.azkar.forEach(azkar => {
                    const card = document.createElement('div');
                    card.className = 'hadith-card';
                    card.innerHTML = `
                        <div class="hadith-text">${azkar.text}</div>
                        <div class="hadith-reference">${azkar.reference}</div>
                        <div class="hadith-grade">${azkar.count}</div>
                    `;
                    container.appendChild(card);
                });
            }

            displayError(containerId, message) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `<p style="text-align: center; color: red; padding: 2rem;">${message}</p>`;
                }
            }
        }

        // Hadith Manager
        class HadithManager {
            constructor() {
                this.hadiths = [];
            }

            async init() {
                await this.loadHadiths();
            }

            async loadHadiths() {
                try {
                    // بيانات الأحاديث النبوية
                    this.hadiths = [
                        {
                            text: "قال رسول الله صلى الله عليه وسلم: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى الله ورسوله، فهجرته إلى الله ورسوله، ومن كانت هجرته لدنيا يصيبها أو امرأة ينكحها، فهجرته إلى ما هاجر إليه'",
                            reference: "رواه البخاري ومسلم",
                            grade: "صحيح"
                        },
                        {
                            text: "قال رسول الله صلى الله عليه وسلم: 'من حسن إسلام المرء تركه ما لا يعنيه'",
                            reference: "رواه الترمذي وقال: حديث حسن صحيح",
                            grade: "حسن صحيح"
                        },
                        {
                            text: "قال رسول الله صلى الله عليه وسلم: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه'",
                            reference: "رواه البخاري ومسلم",
                            grade: "صحيح"
                        },
                        {
                            text: "قال رسول الله صلى الله عليه وسلم: 'الكلمة الطبية صدقة'",
                            reference: "رواه البخاري ومسلم",
                            grade: "صحيح"
                        }
                    ];

                    this.displayHadiths();
                } catch (error) {
                    console.error('Error loading hadiths:', error);
                    this.displayError('hadith-list', 'عذراً، حدث خطأ في تحميل الأحاديث');
                }
            }

            displayHadiths() {
                const container = document.getElementById('hadith-list');
                if (!container) return;

                container.innerHTML = '';

                this.hadiths.forEach(hadith => {
                    const card = document.createElement('div');
                    card.className = 'hadith-card';
                    card.innerHTML = `
                        <div class="hadith-text">${hadith.text}</div>
                        <div class="hadith-reference">${hadith.reference}</div>
                        <div class="hadith-grade">${hadith.grade}</div>
                    `;
                    container.appendChild(card);
                });
            }

            displayError(containerId, message) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `<p style="text-align: center; color: red; padding: 2rem;">${message}</p>`;
                }
            }
        }

        // Ad Manager
        class AdManager {
            constructor() {
                this.clickCount = 0;
                this.adInterval = null;
            }

            init() {
                this.injectAds();
                this.setupAdModal();
                this.setupClickTracking();
            }

            injectAds() {
                // Inject ads into containers
                const adContainers = [
                    'ad-container-1',
                    'ad-container-2', 
                    'ad-container-3',
                    'ad-container-4',
                    'ad-sidebar'
                ];

                adContainers.forEach(containerId => {
                    const container = document.getElementById(containerId);
                    if (container) {
                        // Use the provided ad codes
                        if (containerId === 'ad-sidebar') {
                            // إعلان الشريط الجانبي
                            container.innerHTML = `
                                <div id="container-50691a36ff5f5b69c33f81398fc8214d"></div>
                                <script async="async" data-cfasync="false" src="//pl27889328.effectivegatecpm.com/50691a36ff5f5b69c33f81398fc8214d/invoke.js"></script>
                            `;
                        } else {
                            // الإعلانات الأخرى
                            container.innerHTML = `
                                <script type="text/javascript">
                                    atOptions = {
                                        'key' : '1333b27d45848599574868956a16a6ee',
                                        'format' : 'iframe',
                                        'height' : 300,
                                        'width' : 160,
                                        'params' : {}
                                    };
                                </script>
                                <script type="text/javascript" src="//www.highperformanceformat.com/1333b27d45848599574868956a16a6ee/invoke.js"></script>
                            `;
                        }
                    }
                });
            }

            setupAdModal() {
                const adModal = document.getElementById('ad-modal');
                const closeBtn = document.getElementById('ad-close');
                const modalContent = document.getElementById('ad-modal-content');

                if (closeBtn && adModal) {
                    closeBtn.addEventListener('click', () => {
                        adModal.classList.remove('active');
                    });

                    adModal.addEventListener('click', (e) => {
                        if (e.target === adModal) {
                            adModal.classList.remove('active');
                        }
                    });
                }

                // حقن إعلان في النافذة المنبثقة
                if (modalContent) {
                    modalContent.innerHTML = `
                        <div class="ad-container" style="min-height: 300px; border: none; padding: 2rem;">
                            <script type="text/javascript">
                                atOptions = {
                                    'key' : '1333b27d45848599574868956a16a6ee',
                                    'format' : 'iframe',
                                    'height' : 250,
                                    'width' : 300,
                                    'params' : {}
                                };
                            </script>
                            <script type="text/javascript" src="//www.highperformanceformat.com/1333b27d45848599574868956a16a6ee/invoke.js"></script>
                        </div>
                    `;
                }
            }

            setupClickTracking() {
                // Track clicks on all buttons and interactive elements
                document.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' || 
                        e.target.closest('button') || 
                        e.target.classList.contains('surah-card') ||
                        e.target.closest('.surah-card')) {
                        
                        this.clickCount++;
                        
                        if (this.clickCount % 3 === 0) {
                            this.showAdModal();
                        }
                    }
                });
            }

            showAdModal() {
                const adModal = document.getElementById('ad-modal');
                if (adModal) {
                    adModal.classList.add('active');
                    
                    // Auto close after 10 seconds
                    setTimeout(() => {
                        if (adModal.classList.contains('active')) {
                            adModal.classList.remove('active');
                        }
                    }, 10000);
                }
            }
        }

        // Share Manager
        class ShareManager {
            constructor() {
                // No initialization needed
            }

            init() {
                this.setupShareButton();
            }

            setupShareButton() {
                const shareBtn = document.getElementById('shareBtn');
                if (shareBtn) {
                    shareBtn.addEventListener('click', () => {
                        this.shareSite();
                    });
                }
            }

            async shareSite() {
                const shareData = {
                    title: 'موقع القرآن الكريم والأحاديث النبوية',
                    text: 'موقع متكامل للقرآن الكريم، الأحاديث النبوية، الأدعية والأذكار، ومواقيت الصلاة',
                    url: window.location.href
                };

                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else {
                        // Fallback for browsers that don't support Web Share API
                        this.fallbackShare();
                    }
                } catch (error) {
                    console.log('Error sharing:', error);
                    this.fallbackShare();
                }
            }

            fallbackShare() {
                // Copy URL to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('تم نسخ رابط الموقع إلى الحافظة! يمكنك الآن مشاركته.');
                }).catch(() => {
                    // Fallback if clipboard API is not supported
                    prompt('انسخ الرابط التالي لمشاركته:', window.location.href);
                });
            }
        }

        // App Initialization
        document.addEventListener('DOMContentLoaded', function() {
            // تهيئة APIs
            const quranAPI = new QuranAPI();
            const audioManager = new AudioQuranManager();
            const prayerManager = new PrayerTimesManager();
            const azkarManager = new AzkarManager();
            const hadithManager = new HadithManager();
            const adManager = new AdManager();
            const shareManager = new ShareManager();

            // تحميل البيانات
            quranAPI.loadSurahs();
            audioManager.init();
            prayerManager.init();
            azkarManager.init();
            hadithManager.init();
            adManager.init();
            shareManager.init();

            // جعل APIs متاحة globally
            window.quranAPI = quranAPI;
            window.audioManager = audioManager;

            // إعداد القائمة المتنقلة
            const mobileMenu = document.querySelector('.mobile-menu');
            const navMenu = document.querySelector('nav ul');

            if (mobileMenu && navMenu) {
                mobileMenu.addEventListener('click', function() {
                    navMenu.classList.toggle('show');
                });
            }

            // إعداد البحث في القرآن
            const quranSearchInput = document.getElementById('quran-search');
            const quranSearchButton = document.getElementById('quran-search-btn');

            if (quranSearchButton && quranSearchInput) {
                quranSearchButton.addEventListener('click', function() {
                    const query = quranSearchInput.value.trim();
                    quranAPI.searchSurahs(query);
                });

                quranSearchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        quranSearchButton.click();
                    }
                });

                quranSearchInput.addEventListener('input', function() {
                    if (this.value.trim() === '') {
                        document.getElementById('quran-search-results').classList.remove('active');
                    }
                });
            }

            // إعداد البحث العام
            const searchInput = document.getElementById('global-search');
            const searchButton = document.getElementById('search-btn');

            if (searchButton && searchInput) {
                searchButton.addEventListener('click', function() {
                    const query = searchInput.value.trim();
                    if (query) {
                        // البحث في جميع الأقسام
                        quranAPI.searchSurahs(query);
                        setTimeout(() => {
                            document.getElementById('quran-section').scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    } else {
                        alert('يرجى إدخال نص للبحث');
                        searchInput.focus();
                    }
                });

                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchButton.click();
                    }
                });
            }

            // إعداد زر العودة للأعلى
            const scrollToTopBtn = document.getElementById('scrollToTop');
            if (scrollToTopBtn) {
                scrollToTopBtn.addEventListener('click', function() {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });

                window.addEventListener('scroll', function() {
                    if (window.pageYOffset > 300) {
                        scrollToTopBtn.style.display = 'flex';
                    } else {
                        scrollToTopBtn.style.display = 'none';
                    }
                });
            }

            // إغلاق نتائج البحث عند النقر خارجها
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.quran-search-container')) {
                    document.getElementById('quran-search-results').classList.remove('active');
                }
            });

            // تحسين التنقل بين الأقسام
            document.querySelectorAll('nav a, .sidebar a').forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                });
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu.classList.contains('show')) {
                        navMenu.classList.remove('show');
                    }
                });
            });
        });