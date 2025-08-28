/**
 * Klasa do zarządzania sliderem zdjęć z dynamicznym pobieraniem z API
 */
class PhotoSlider {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'http://localhost:8888/api/images';
        this.imageSize = options.imageSize || 'medium'; // small, medium, original
        this.defaultImage = options.defaultImage || 'https://via.placeholder.com/800x600/1466b8/ffffff?text=Demo+Image';
        this.container = options.container || document.querySelector('.photo-container');
        this.transition = options.transition || 'fade'; // fade, slide, zoom
        this.loop = options.loop !== undefined ? options.loop : true; // czy zapętlać pokaz
        this.transitionDuration = options.transitionDuration || 500; // czas trwania przejścia w ms
        this.autoplaySpeed = options.autoplaySpeed || 3000; // szybkość automatycznego przejścia w ms
        this.backgroundColor = options.backgroundColor || 'transparent'; // kolor tła
        this.autoplay = options.autoplay !== undefined ? options.autoplay : false; // automatyczne uruchomienie
        
        // Przełączniki widoczności elementów
        this.showNavigation = options.showNavigation !== undefined ? options.showNavigation : true;
        this.showDate = options.showDate !== undefined ? options.showDate : true;
        this.showAuthor = options.showAuthor !== undefined ? options.showAuthor : true;
        this.showGradient = options.showGradient !== undefined ? options.showGradient : true;
        
        this.currentIndex = 0;
        this.images = [];
        this.isLoading = false;
        this.isTransitioning = false;
        this.autoplayInterval = null;
        this.isPlaying = false;
        
        this.init();
    }

    /**
     * Inicjalizacja slidera
     */
    async init() {
        this.showLoader();
        this.applyBackgroundColor();
        this.updateGradientVisibility();
        await this.loadImages();
        this.setupControls();
        this.displayCurrentImage();
        
        // Automatyczne uruchomienie jeśli włączone
        if (this.autoplay) {
            this.startAutoplay();
        }
    }

    /**
     * Pobieranie zdjęć z API
     */
    async loadImages() {
        try {
            this.isLoading = true;
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 sekund timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Sprawdzenie czy otrzymaliśmy tablicę zdjęć
            if (Array.isArray(data) && data.length > 0) {
                this.images = data.map(item => this.processImageData(item));
            } else if (data && data.urls) {
                // Jeśli otrzymaliśmy pojedynczy obiekt
                this.images = [this.processImageData(data)];
            } else {
                throw new Error('Brak zdjęć w odpowiedzi API');
            }

        } catch (error) {
            console.warn('Błąd podczas pobierania zdjęć z API:', error.message);
            this.loadDefaultImages();
        } finally {
            this.isLoading = false;
            this.hideLoader();
        }
    }

    /**
     * Przetwarzanie danych pojedynczego zdjęcia
     */
    processImageData(imageData) {
        const urls = imageData.urls || {};
        let selectedUrl;

        // Wybór odpowiedniego rozmiaru zdjęcia
        switch (this.imageSize) {
            case 'small':
                selectedUrl = urls.small || urls.medium || urls.original;
                break;
            case 'original':
                selectedUrl = urls.original || urls.medium || urls.small;
                break;
            case 'medium':
            default:
                selectedUrl = urls.medium || urls.original || urls.small;
                break;
        }

        return {
            id: imageData.id,
            url: selectedUrl || this.defaultImage,
            author: imageData.author || 'Nieznany autor',
            width: imageData.width,
            height: imageData.height,
            created_at: imageData.created_at
        };
    }

    /**
     * Ładowanie domyślnych zdjęć w przypadku błędu API
     */
    loadDefaultImages() {
        this.images = [
            {
                id: 'demo-1',
                url: this.defaultImage,
                author: 'Demo',
                width: 800,
                height: 600,
                created_at: new Date().toISOString()
            }
        ];
    }

    /**
     * Konfiguracja kontrolek slidera
     */
    setupControls() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const playPauseBtn = document.querySelector('.play-pause-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousImage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Obsługa klawiatury
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.previousImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
            }
        });
    }

    /**
     * Wyświetlenie aktualnego zdjęcia z efektem przejścia
     */
    displayCurrentImage() {
        if (this.images.length === 0 || this.isTransitioning) return;

        const currentImage = this.images[this.currentIndex];
        const imageElement = document.querySelector('.photo-display');
        
        if (imageElement) {
            this.applyTransition(imageElement, currentImage.url);
        }

        this.updateDots();
        this.updateImageInfo(currentImage);
    }

    /**
     * Zastosowanie efektu przejścia
     */
    applyTransition(element, newImageUrl) {
        this.isTransitioning = true;
        
        switch (this.transition) {
            case 'fade':
                this.fadeTransition(element, newImageUrl);
                break;
            case 'slide':
                this.slideTransition(element, newImageUrl);
                break;
            case 'zoom':
                this.zoomTransition(element, newImageUrl);
                break;
            default:
                // Domyślne przejście bez efektu
                element.style.backgroundImage = `url("${newImageUrl}")`;
                this.isTransitioning = false;
        }
    }

    /**
     * Efekt fade (zanikanie)
     */
    fadeTransition(element, newImageUrl) {
        element.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.backgroundImage = `url("${newImageUrl}")`;
            element.style.opacity = '1';
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, this.transitionDuration);
        }, this.transitionDuration / 2);
    }

    /**
     * Efekt slide (przesuwanie)
     */
    slideTransition(element, newImageUrl) {
        const container = element.parentElement;
        const tempElement = element.cloneNode(true);
        
        // Ustawienie nowego zdjęcia na tymczasowym elemencie
        tempElement.style.backgroundImage = `url("${newImageUrl}")`;
        tempElement.style.transform = 'translateX(100%)';
        tempElement.style.transition = `transform ${this.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        tempElement.style.zIndex = '2';
        tempElement.classList.add('slide-transition-enter');
        
        // Dodanie klasy do obecnego elementu
        element.style.transition = `transform ${this.transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        element.classList.add('slide-transition-exit');
        
        container.appendChild(tempElement);
        
        // Wymuszenie repaint przed animacją
        tempElement.offsetHeight;
        
        // Animacja przesunięcia z płynnym najechaniem
        requestAnimationFrame(() => {
            element.style.transform = 'translateX(-100%)';
            tempElement.style.transform = 'translateX(0)';
            
            setTimeout(() => {
                element.style.backgroundImage = `url("${newImageUrl}")`;
                element.style.transform = 'translateX(0)';
                element.style.transition = '';
                element.classList.remove('slide-transition-exit');
                
                if (container.contains(tempElement)) {
                    container.removeChild(tempElement);
                }
                this.isTransitioning = false;
            }, this.transitionDuration);
        });
    }

    /**
     * Efekt zoom (powiększanie)
     */
    zoomTransition(element, newImageUrl) {
        element.style.transition = `transform ${this.transitionDuration}ms ease-in-out, opacity ${this.transitionDuration}ms ease-in-out`;
        element.style.transform = 'scale(1.1)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.backgroundImage = `url("${newImageUrl}")`;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, this.transitionDuration);
        }, this.transitionDuration / 2);
    }

    /**
     * Aktualizacja kropek wskaźnika
     */
    updateDots() {
        const dotsContainer = document.querySelector('.dots-container');
        if (!dotsContainer) return;

        // Usunięcie istniejących kropek
        dotsContainer.innerHTML = '';

        // Dodanie nowych kropek
        this.images.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `h-2 w-2 rounded-full cursor-pointer transition-colors ${
                index === this.currentIndex ? 'bg-[var(--primary-color)]' : 'bg-white/50'
            }`;
            dot.addEventListener('click', () => this.goToImage(index));
            dotsContainer.appendChild(dot);
        });
    }

    /**
     * Aktualizacja informacji o zdjęciu
     */
    updateImageInfo(image) {
        const infoElement = document.querySelector('.image-info');
        if (infoElement) {
            let infoHTML = '';
            
            if (this.showAuthor && image.author) {
                infoHTML += `<p class="text-sm text-white/80">Autor: ${image.author}</p>`;
            }
            
            if (this.showDate && image.created_at) {
                infoHTML += `<p class="text-xs text-white/60">${new Date(image.created_at).toLocaleDateString()}</p>`;
            }
            
            infoElement.innerHTML = infoHTML;
        }
        
        // Kontrola widoczności nawigacji
        this.updateNavigationVisibility();
    }
    
    /**
     * Aktualizacja widoczności nawigacji
     */
    updateNavigationVisibility() {
        const navigationElements = [
            document.querySelector('.prev-btn'),
            document.querySelector('.next-btn'),
            document.querySelector('.play-pause-btn'),
            document.querySelector('.dots-container')
        ];
        
        navigationElements.forEach(element => {
            if (element) {
                element.style.display = this.showNavigation ? 'block' : 'none';
            }
        });
    }

    /**
     * Przejście do poprzedniego zdjęcia
     */
    previousImage() {
        if (this.images.length === 0 || this.isTransitioning) return;
        
        if (!this.loop && this.currentIndex === 0) {
            console.log('Osiągnięto początek galerii (loop wyłączony)');
            return;
        }
        
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.displayCurrentImage();
    }

    /**
     * Przejście do następnego zdjęcia
     */
    nextImage() {
        if (this.images.length === 0 || this.isTransitioning) return;
        
        if (!this.loop && this.currentIndex === this.images.length - 1) {
            console.log('Osiągnięto koniec galerii (loop wyłączony)');
            return;
        }
        
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.displayCurrentImage();
    }

    /**
     * Przejście do konkretnego zdjęcia
     */
    goToImage(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this.displayCurrentImage();
        }
    }

    /**
     * Toggle play/pause dla automatycznego slidera
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
    }

    /**
     * Pokazanie loadera
     */
    showLoader() {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    /**
     * Ukrycie loadera
     */
    hideLoader() {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Odświeżenie zdjęć z API
     */
    async refresh() {
        await this.loadImages();
        this.currentIndex = 0;
        this.displayCurrentImage();
    }

    /**
     * Zmiana rozmiaru zdjęć
     */
    setImageSize(size) {
        if (['small', 'medium', 'original'].includes(size)) {
            this.imageSize = size;
            this.refresh();
        }
    }

    /**
     * Zmiana URL API
     */
    setApiUrl(url) {
        this.apiUrl = url;
        this.refresh();
    }

    /**
     * Zmiana typu przejścia
     */
    setTransition(transition) {
        const validTransitions = ['fade', 'slide', 'zoom'];
        if (validTransitions.includes(transition)) {
            this.transition = transition;
            console.log(`Zmieniono efekt przejścia na: ${transition}`);
        } else {
            console.warn(`Nieprawidłowy efekt przejścia: ${transition}. Dostępne: ${validTransitions.join(', ')}`);
        }
    }

    /**
     * Włączenie/wyłączenie zapętlania
     */
    setLoop(loop) {
        this.loop = Boolean(loop);
        console.log(`Zapętlanie ${this.loop ? 'włączone' : 'wyłączone'}`);
    }

    /**
     * Zmiana czasu trwania przejścia
     */
    setTransitionDuration(duration) {
        if (duration > 0) {
            this.transitionDuration = duration;
            console.log(`Zmieniono czas przejścia na: ${duration}ms`);
        }
    }

    /**
     * Zmiana szybkości automatycznego przejścia
     */
    setAutoplaySpeed(speed) {
        if (speed > 0) {
            this.autoplaySpeed = speed;
            console.log(`Zmieniono szybkość autoplay na: ${speed}ms`);
            // Jeśli autoplay jest aktywny, zrestartuj z nową szybkością
            if (this.isPlaying) {
                this.stopAutoplay();
                this.startAutoplay();
            }
        }
    }

    /**
     * Zmiana koloru tła
     */
    setBackgroundColor(color) {
        this.backgroundColor = color;
        this.applyBackgroundColor();
        console.log(`Zmieniono kolor tła na: ${color}`);
    }

    /**
     * Zastosowanie koloru tła
     */
    applyBackgroundColor() {
        if (this.container) {
            const photoDisplay = this.container.querySelector('.photo-display');
            if (photoDisplay) {
                let backgroundColor;
                switch (this.backgroundColor) {
                    case 'black':
                        backgroundColor = '#000000';
                        break;
                    case 'white':
                        backgroundColor = '#ffffff';
                        break;
                    case 'gray':
                        backgroundColor = '#6b7280';
                        break;
                    case 'blue':
                        backgroundColor = '#1466b8';
                        break;
                    case 'transparent':
                    default:
                        backgroundColor = 'transparent';
                        break;
                }
                photoDisplay.style.backgroundColor = backgroundColor;
            }
        }
    }

    /**
     * Uruchomienie automatycznego pokazu
     */
    startAutoplay() {
        if (!this.isPlaying && this.images.length > 1) {
            this.isPlaying = true;
            this.autoplayInterval = setInterval(() => {
                this.nextImage();
            }, this.autoplaySpeed);
            
            // Aktualizacja ikony play/pause
            const playIcon = this.container?.querySelector('.play-icon');
            const pauseIcon = this.container?.querySelector('.pause-icon');
            if (playIcon && pauseIcon) {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            }
        }
    }

    /**
     * Zatrzymanie automatycznego pokazu
     */
    stopAutoplay() {
        if (this.isPlaying) {
            this.isPlaying = false;
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
            
            // Aktualizacja ikony play/pause
            const playIcon = this.container?.querySelector('.play-icon');
            const pauseIcon = this.container?.querySelector('.pause-icon');
            if (playIcon && pauseIcon) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        }
    }

    /**
     * Zmiana domyślnego obrazu
     */
    setDefaultImage(imageUrl) {
        if (imageUrl && typeof imageUrl === 'string') {
            this.defaultImage = imageUrl;
            console.log(`Domyślny obraz zmieniony na: ${imageUrl}`);
            // Jeśli aktualnie wyświetlamy domyślny obraz, odśwież
            if (this.images.length === 1 && this.images[0].id === 'demo-1') {
                this.loadDefaultImages();
                this.displayCurrentImage();
            }
        }
    }

    /**
     * Pobranie dostępnych efektów przejścia
     */
    getAvailableTransitions() {
        return ['fade', 'slide', 'zoom'];
    }

    /**
     * Włączenie/wyłączenie nawigacji
     */
    setNavigationVisibility(visible) {
        this.showNavigation = Boolean(visible);
        this.updateNavigationVisibility();
        console.log(`Nawigacja ${this.showNavigation ? 'włączona' : 'wyłączona'}`);
    }
    
    /**
     * Włączenie/wyłączenie wyświetlania daty
     */
    setDateVisibility(visible) {
        this.showDate = Boolean(visible);
        this.updateImageInfo(this.images[this.currentIndex] || {});
        console.log(`Wyświetlanie daty ${this.showDate ? 'włączone' : 'wyłączone'}`);
    }
    
    /**
     * Włączenie/wyłączenie wyświetlania autora
     */
    setAuthorVisibility(visible) {
        this.showAuthor = Boolean(visible);
        this.updateImageInfo(this.images[this.currentIndex] || {});
        console.log(`Wyświetlanie autora ${this.showAuthor ? 'włączone' : 'wyłączone'}`);
    }
    
    /**
     * Ustawienie widoczności gradientu
     */
    setGradientVisibility(visible) {
        this.showGradient = Boolean(visible);
        this.updateGradientVisibility();
        console.log(`Gradient ${this.showGradient ? 'włączony' : 'wyłączony'}`);
    }
    
    /**
     * Aktualizacja widoczności gradientu
     */
    updateGradientVisibility() {
        const controls = this.container.querySelector('.controls');
        if (controls) {
            if (this.showGradient) {
                controls.classList.remove('gradient-hidden');
                controls.classList.add('gradient-visible');
            } else {
                controls.classList.remove('gradient-visible');
                controls.classList.add('gradient-hidden');
            }
        }
    }
    
    /**
     * Ustawienie wszystkich przełączników widoczności
     */
    setVisibilityToggles(options = {}) {
        if (options.navigation !== undefined) {
            this.setNavigationVisibility(options.navigation);
        }
        if (options.date !== undefined) {
            this.setDateVisibility(options.date);
        }
        if (options.author !== undefined) {
            this.setAuthorVisibility(options.author);
        }
        if (options.gradient !== undefined) {
            this.setGradientVisibility(options.gradient);
        }
    }
    
    /**
     * Pobranie stanu przełączników
     */
    getVisibilityToggles() {
        return {
            navigation: this.showNavigation,
            date: this.showDate,
            author: this.showAuthor,
            gradient: this.showGradient
        };
    }

    /**
     * Pobranie aktualnej konfiguracji
     */
    getConfig() {
        return {
            apiUrl: this.apiUrl,
            imageSize: this.imageSize,
            transition: this.transition,
            loop: this.loop,
            transitionDuration: this.transitionDuration,
            autoplaySpeed: this.autoplaySpeed,
            backgroundColor: this.backgroundColor,
            autoplay: this.autoplay,
            isPlaying: this.isPlaying,
            showNavigation: this.showNavigation,
            showDate: this.showDate,
            showAuthor: this.showAuthor,
            showGradient: this.showGradient,
            currentIndex: this.currentIndex,
            totalImages: this.images.length
        };
    }
}

// Eksport dla użycia w innych plikach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoSlider;
}

// Globalna dostępność w przeglądarce
if (typeof window !== 'undefined') {
    window.PhotoSlider = PhotoSlider;
}