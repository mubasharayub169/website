// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Slider functionality (initialize only on pages that have a slider)
let slideIndex = 1;
let slideTimer = null;
let touchStartX = null;
let pointerStartX = null;
const sliderSlides = document.querySelectorAll('.slide');
const sliderDots = document.querySelectorAll('.dot');

if (sliderSlides.length > 0 && sliderDots.length > 0) {
    showSlides(slideIndex);
    slideTimer = setInterval(() => {
        changeSlide(1);
    }, 5000);

    const sliderContainer = document.querySelector('.slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', (event) => {
            const touch = event.changedTouches && event.changedTouches[0];
            if (!touch) return;
            touchStartX = touch.clientX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (event) => {
            const touch = event.changedTouches && event.changedTouches[0];
            if (!touch || touchStartX === null) return;

            const deltaX = touch.clientX - touchStartX;
            touchStartX = null;

            // Basic swipe threshold so accidental taps do not trigger slide changes.
            if (Math.abs(deltaX) < 45) return;

            if (deltaX < 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
        }, { passive: true });

        // Pointer fallback for devices/browsers that rely on pointer events.
        sliderContainer.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
            pointerStartX = event.clientX;
        });

        sliderContainer.addEventListener('pointerup', (event) => {
            if (pointerStartX === null) return;
            const deltaX = event.clientX - pointerStartX;
            pointerStartX = null;
            if (Math.abs(deltaX) < 45) return;

            if (deltaX < 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
        });
    }
}

function changeSlide(n) {
    if (!sliderSlides.length || !sliderDots.length) return;
    clearInterval(slideTimer);
    showSlides(slideIndex += n);
    slideTimer = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function currentSlide(n) {
    if (!sliderSlides.length || !sliderDots.length) return;
    clearInterval(slideTimer);
    showSlides(slideIndex = n);
    slideTimer = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function showSlides(n) {
    let slides = document.querySelectorAll('.slide');
    let dots = document.querySelectorAll('.dot');
    
    // Skip if no slides exist (page doesn't have a slider)
    if (slides.length === 0 || dots.length === 0) {
        return;
    }
    
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[slideIndex - 1] && dots[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('active');
        dots[slideIndex - 1].classList.add('active');
    }
}

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const setMobileNavOffset = () => {
    if (!mainNavbar || window.innerWidth > 768) return;
    const navbarBottom = Math.ceil(mainNavbar.getBoundingClientRect().bottom);
    document.documentElement.style.setProperty('--mobile-nav-top', `${navbarBottom + 8}px`);
};

const setMobileMenuState = (isOpen) => {
    if (!navMenu || !hamburger) return;
    navMenu.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('menu-open', isOpen);
};

if (hamburger) {
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('tabindex', '0');
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', () => {
        if (!navMenu) return;
        setMobileNavOffset();
        const isOpen = !navMenu.classList.contains('active');
        setMobileMenuState(isOpen);
    });

    hamburger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            hamburger.click();
        }
    });

    document.addEventListener('click', (event) => {
        if (!navMenu || !navMenu.classList.contains('active')) return;
        const clickedInsideMenu = navMenu.contains(event.target);
        const clickedHamburger = hamburger.contains(event.target);
        if (!clickedInsideMenu && !clickedHamburger) {
            setMobileMenuState(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !navMenu) return;
        setMobileMenuState(false);
    });

    window.addEventListener('resize', () => {
        setMobileNavOffset();
        if (window.innerWidth > 768) {
            setMobileMenuState(false);
        }
    });
}

// Close mobile menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-menu a');
const loginLinks = document.querySelectorAll('a.btn-login');
const normalizePath = (path) => path.replace(/\/$/, '');

loginLinks.forEach(link => {
    link.setAttribute('href', 'dashboard-login.html');
    if (!link.getAttribute('aria-label')) {
        link.setAttribute('aria-label', 'Open staff dashboard login');
    }
});

const syncCurrentNavLink = (currentSectionId = '') => {
    const currentPath = normalizePath(window.location.pathname);

    navLinks.forEach(link => {
        const linkUrl = new URL(link.getAttribute('href'), window.location.href);
        const linkPath = normalizePath(linkUrl.pathname);
        const isHomeLink = linkPath.endsWith('/index.html');
        const matchesSection = Boolean(currentSectionId) && linkUrl.hash === `#${currentSectionId}` && linkPath === currentPath;
        const matchesPage = !linkUrl.hash && linkPath === currentPath;
        const matchesHomePage = isHomeLink && currentPath.endsWith('/index.html');

        link.classList.toggle('active', matchesSection || matchesPage || matchesHomePage);
    });
};

navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        if (!navMenu) return;
        if (window.innerWidth <= 768) {
            setMobileMenuState(false);
            return;
        }

        window.setTimeout(() => setMobileMenuState(false), 0);
    });
});

// Cache sections for performance
let sections = [];
let updateNavigation = debounce(() => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });

    syncCurrentNavLink(current);
}, 100);

// Active nav link on scroll with debouncing
window.addEventListener('scroll', updateNavigation, { passive: true });

syncCurrentNavLink();

// Home page header behavior: hide emergency bar on scroll and lift navbar to top
const emergencyBanner = document.querySelector('.emergency-banner');
const mainNavbar = document.querySelector('.navbar');

if (emergencyBanner && mainNavbar && document.body.classList.contains('home-page')) {
    let ticking = false;

    const syncHeaderOffset = () => {
        const headerOffset = emergencyBanner.offsetHeight;
        document.documentElement.style.setProperty('--home-header-offset', `${headerOffset}px`);
    };

    const toggleHeaderState = () => {
        if (window.scrollY > 14) {
            document.body.classList.add('banner-hidden');
        } else {
            document.body.classList.remove('banner-hidden');
        }
        setMobileNavOffset();
        ticking = false;
    };

    const onHeaderScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(toggleHeaderState);
            ticking = true;
        }
    };

    syncHeaderOffset();
    toggleHeaderState();
    window.addEventListener('scroll', onHeaderScroll, { passive: true });
    window.addEventListener('resize', syncHeaderOffset, { passive: true });
}

setMobileNavOffset();

// Initialize sections cache
document.addEventListener('DOMContentLoaded', () => {
    sections = document.querySelectorAll('section');
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm && contactForm.tagName === 'FORM') {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const name = contactForm.querySelector('input[type="text"]').value.trim();
        const email = contactForm.querySelector('input[type="email"]').value.trim();
        const phone = contactForm.querySelector('input[type="tel"]').value.trim();
        const department = contactForm.querySelector('select').value.trim();
        const message = contactForm.querySelector('textarea').value.trim();
        
        // Validate form
        if (!name || !email || !phone || !department || !message) {
            alert('Please fill in all fields');
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const defaultButtonText = submitButton ? submitButton.textContent : '';
        const web3FormsAccessKey = window.WEB3FORMS_ACCESS_KEY || '254447ac-d84b-42f6-91f2-6f4fd7a551b2';

        if (!web3FormsAccessKey) {
            alert('Web3Forms access key is missing. Please add your key before using this form.');
            return;
        }

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';
            }

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: web3FormsAccessKey,
                    subject: `New Contact Request - ${department}`,
                    from_name: name,
                    name,
                    email,
                    phone,
                    department,
                    message,
                    botcheck: ''
                })
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || payload.success === false) {
                throw new Error(payload.message || 'Contact submit failed');
            }

            alert('Thank you! Your request has been submitted successfully. We will contact you soon.');
            contactForm.reset();
        } catch (_error) {
            alert('Unable to submit form right now. Please try again or call (053) 3605377 for immediate help.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = defaultButtonText;
            }
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Book appointment buttons
const appointmentButtons = document.querySelectorAll('.btn-primary, .btn-small');
appointmentButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (e.target.textContent.includes('Book') || e.target.textContent.includes('appointment')) {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-in';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .doctor-card, .feature-box').forEach(el => {
    observer.observe(el);
});

// Mobile responsive adjustments
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu) {
        navMenu.classList.remove('active');
        if (hamburger) {
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }
});

// Doctor Search and Filter Functionality
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const doctorsGrid = document.getElementById('doctorsGrid');
const noResults = document.getElementById('noResults');

if (searchInput && categoryFilter && doctorsGrid && noResults) {
    function filterDoctors() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value.trim();
        const doctorCards = doctorsGrid.querySelectorAll('.doctor-card');
        
        let visibleCount = 0;

        doctorCards.forEach(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const category = card.getAttribute('data-category') || card.getAttribute('data-specialty') || '';

            const hasSearch = searchTerm !== '';
            const hasFilter = selectedCategory !== '';

            // Apply both conditions together when both are active.
            const matchesSearch = !hasSearch || name.includes(searchTerm);
            const matchesCategory = !hasFilter || category === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });

        if (visibleCount === 0 && (hasSearch || hasFilter)) {
            // Search/filter active but no results
            noResults.style.display = 'block';
            noResults.innerHTML = '<p style="color: var(--gray-color); font-size: 16px;">No doctors found matching your search.</p>';
        } else {
            // Results found or no search/filter
            noResults.style.display = 'none';
        }
    }

    // Initialize - shows all doctors
    filterDoctors();

    // Event listeners
    searchInput.addEventListener('input', filterDoctors);
    searchInput.addEventListener('keyup', filterDoctors);
    categoryFilter.addEventListener('change', filterDoctors);
}

// Accessibility helpers: skip link and main landmark
document.addEventListener('DOMContentLoaded', () => {
    const mainTarget = document.querySelector('main') || document.querySelector('section');
    if (mainTarget && !mainTarget.id) {
        mainTarget.id = 'main-content';
    }

    const mainTargetId = mainTarget && mainTarget.id ? mainTarget.id : 'main-content';

    const existingSkipLink = document.querySelector('.skip-link');
    if (existingSkipLink) {
        existingSkipLink.setAttribute('href', `#${mainTargetId}`);
    } else {
        const skipLink = document.createElement('a');
        skipLink.href = `#${mainTargetId}`;
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    if (mainTarget && !mainTarget.hasAttribute('tabindex')) {
        mainTarget.setAttribute('tabindex', '-1');
    }

    const sliderControls = document.querySelector('.slider-controls');
    if (sliderControls) {
        const prevButton = sliderControls.querySelector('.prev');
        const nextButton = sliderControls.querySelector('.next');
        if (prevButton && !prevButton.hasAttribute('aria-label')) {
            prevButton.setAttribute('aria-label', 'Previous slide');
        }
        if (nextButton && !nextButton.hasAttribute('aria-label')) {
            nextButton.setAttribute('aria-label', 'Next slide');
        }
    }

    if (searchInput && !searchInput.hasAttribute('aria-label')) {
        searchInput.setAttribute('aria-label', 'Search doctors by name');
    }
    if (categoryFilter && !categoryFilter.hasAttribute('aria-label')) {
        categoryFilter.setAttribute('aria-label', 'Filter doctors by service');
    }
});

// Mobile back-to-top arrow button
document.addEventListener('DOMContentLoaded', () => {
    const backToTop = document.createElement('button');
    backToTop.type = 'button';
    backToTop.className = 'back-to-top-btn';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.textContent = '↑';
    document.body.appendChild(backToTop);

    const updateBackToTop = () => {
        const isMobile = window.innerWidth <= 768;
        const shouldShow = isMobile && window.scrollY > 280;
        backToTop.classList.toggle('show', shouldShow);
    };

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    window.addEventListener('resize', updateBackToTop, { passive: true });
    updateBackToTop();
});

// Service pages: recommended doctors based on selected service
document.addEventListener('DOMContentLoaded', () => {
    const serviceDoctorMap = {
        'cardiology.html': ['zain-safdar', 'm-saleem-azeemi'],
        'medical-specialist.html': ['suleman-bashir', 'm-saleem-azeemi'],
        'respiratory-care.html': ['m-zain-ul-abideen'],
        'neurology.html': ['soban-sarwar', 'mohsin-ali-nadir', 'hamid-mukhtar-butt'],
        'orthopedics.html': ['asad-ali-sandhu'],
        'rehabilitation-services.html': ['subhan-gondal'],
        'general-surgery.html': ['muhammad-ikram', 'hassan-mahmud'],
        'obstetrics-gynecology.html': ['sara-zain'],
        'pediatrics.html': ['kanwal-shehzad', 'm-bilal-abid'],
        'ophthalmology.html': ['muhammad-owais-sharif', 'm-waheedullah-khan'],
        'dental-services.html': ['umar-draz-tariq'],
        'gastroenterology.html': ['mujahid-israr', 'talal-khurshid-bhatti', 'suleman-bashir']
    };

    const serviceRecommendationMeta = {
        'cardiology.html': {
            heading: 'Recommended Cardiologists',
            description: 'Our cardiac team for this service includes the following specialists.'
        },
        'medical-specialist.html': {
            heading: 'Recommended Medical Specialists',
            description: 'The following physicians are recommended for this service.'
        },
        'respiratory-care.html': {
            heading: 'Recommended Respiratory Specialists',
            description: 'Our chest and respiratory experts for this service are listed below.'
        },
        'neurology.html': {
            heading: 'Recommended Neurologists',
            description: 'The following neurological specialists are recommended for this service.'
        },
        'orthopedics.html': {
            heading: 'Recommended Orthopedic Specialists',
            description: 'Our orthopedic specialists for this service are listed below.'
        },
        'rehabilitation-services.html': {
            heading: 'Recommended Physiotherapy Specialists',
            description: 'The following specialist is recommended for rehabilitation and physiotherapy care.'
        },
        'general-surgery.html': {
            heading: 'Recommended Surgeons',
            description: 'The following surgeons are recommended for this service.'
        },
        'obstetrics-gynecology.html': {
            heading: 'Recommended Gynecology Specialists',
            description: 'Our recommended specialist for this service is listed below.'
        },
        'pediatrics.html': {
            heading: 'Recommended Pediatric Specialists',
            description: 'The following pediatric specialists are recommended for this service.'
        },
        'ophthalmology.html': {
            heading: 'Recommended Eye Specialists',
            description: 'Our recommended eye care specialists for this service are listed below.'
        },
        'dental-services.html': {
            heading: 'Recommended Dental Specialist',
            description: 'The following dental specialist is recommended for this service.'
        },
        'gastroenterology.html': {
            heading: 'Recommended Gastroenterology Specialists',
            description: 'The following specialists are recommended for digestive and liver care.'
        }
    };

    const currentFile = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const recommendedSlugs = serviceDoctorMap[currentFile];
    const recommendationMeta = serviceRecommendationMeta[currentFile] || {
        heading: 'Recommended Doctors',
        description: 'Based on this service, our recommended specialists are listed below.'
    };

    if (!Array.isArray(recommendedSlugs) || recommendedSlugs.length === 0) {
        return;
    }

    const serviceContainer = document.querySelector('section.services .container');
    if (!serviceContainer) return;

    const ensureDoctorsData = (onReady) => {
        if (Array.isArray(window.doctorsData)) {
            onReady();
            return;
        }

        let doctorsScript = document.querySelector('script[data-doctors-data="true"]');

        if (!doctorsScript) {
            doctorsScript = document.createElement('script');
            doctorsScript.src = 'doctors-data.js';
            doctorsScript.setAttribute('data-doctors-data', 'true');
            doctorsScript.onload = onReady;
            doctorsScript.onerror = () => {};
            document.body.appendChild(doctorsScript);
            return;
        }

        doctorsScript.addEventListener('load', onReady, { once: true });
        if (Array.isArray(window.doctorsData)) {
            onReady();
        }
    };

    ensureDoctorsData(() => {
        const doctorsData = Array.isArray(window.doctorsData) ? window.doctorsData : [];
        if (!doctorsData.length) return;

        const recommendedDoctors = recommendedSlugs
            .map((slug) => doctorsData.find((doctor) => doctor.slug === slug))
            .filter(Boolean);

        if (!recommendedDoctors.length) return;

        let section = document.getElementById('recommended-doctors-section');
        if (!section) {
            section = document.createElement('section');
            section.id = 'recommended-doctors-section';
            section.className = 'services';
            section.style.padding = '30px 0 0';
            section.innerHTML = `
                <h2 style="margin-bottom: 14px;">${recommendationMeta.heading}</h2>
                <p class="inner-page-intro" style="margin-bottom: 24px;">${recommendationMeta.description}</p>
                <div class="doctors-grid" id="recommendedDoctorsGrid"></div>
            `;
            serviceContainer.appendChild(section);
        }

        const grid = section.querySelector('#recommendedDoctorsGrid');
        if (!grid) return;

        grid.innerHTML = recommendedDoctors.map((doctor) => {
            const profileUrl = doctor.slug
                ? `doctor-profile.html?slug=${encodeURIComponent(doctor.slug)}`
                : '#';
            const hasCardPhoto = Boolean(doctor.image);
            const isFemaleDoctor = doctor.gender === 'female';
            const initials = (doctor.name || '')
                .replace('Dr.', '')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join('');

            return `
                <a href="${profileUrl}" class="doctor-card" data-name="${doctor.name || ''}" data-specialty="${doctor.specialty || ''}">
                    <div class="doctor-image">
                        ${hasCardPhoto
                            ? `<img class="doctor-card-photo" src="${doctor.image}" alt="${doctor.name}" loading="lazy" decoding="async">`
                            : `<div class="doctor-image-placeholder ${isFemaleDoctor ? 'doctor-image-placeholder-female' : ''}" aria-label="${doctor.name} photo coming soon">
                                    <i class="fas ${isFemaleDoctor ? 'fa-user-nurse' : 'fa-user-md'}" aria-hidden="true"></i>
                                    <span>${initials}</span>
                               </div>`}
                    </div>
                    <div class="doctor-name-row">
                        <h3>${doctor.name || ''}</h3>
                        ${doctor.badge ? `<span class="doctor-role-badge" aria-label="${doctor.badge} badge">${doctor.badge}</span>` : ''}
                    </div>
                    <p class="specialty">${doctor.specialty || ''}</p>
                    <p class="doctor-details">${doctor.details || ''}</p>
                    <div class="btn btn-small">View Profile</div>
                </a>
            `;
        }).join('');
    });
});

// End of file

