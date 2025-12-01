// API Configuration
const API_BASE = "https://school-portal-backend-ar5x.onrender.com/api";

// ===================================
// NAVIGATION
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  const nav = document.getElementById('topNav');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Scroll effect on navigation
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
  
  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
  
  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
  
  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
        
        // Close mobile menu
        navMenu.classList.remove('active');
      }
    });
  });
});

// ===================================
// HERO SLIDER
// ===================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;
  const slideInterval = 8000; // 8 seconds
  
  if (slides.length === 0) return;
  
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  // Auto advance slides
  setInterval(nextSlide, slideInterval);
  
  // Show first slide
  showSlide(0);
  
  console.log(`Hero slider initialized with ${slides.length} slides`);
}

// Initialize slider
initHeroSlider();

// ===================================
// MODAL MANAGEMENT
// ===================================
const modals = {
  dashboard: document.getElementById('dashboardModal'),
  signin: document.getElementById('signinModal')
};

// Open modal
document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const modalName = btn.getAttribute('data-modal');
    if (modals[modalName]) {
      modals[modalName].classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Refresh feather icons
      setTimeout(() => feather.replace(), 100);
    }
  });
});

// Close modal
document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    Object.values(modals).forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  });
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    Object.values(modals).forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

// ===================================
// SIGN IN FUNCTIONALITY
// ===================================
const signinBtn = document.getElementById('signin-btn');
const demoBtn = document.getElementById('demo-btn');
const signinMsg = document.getElementById('signin-msg');

function showMessage(msg, isError = false) {
  signinMsg.textContent = msg;
  signinMsg.className = `form-message show ${isError ? 'error' : 'success'}`;
}

if (signinBtn) {
  signinBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const role = document.getElementById('signin-role').value;
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value.trim();
    
    if (!username || !password) {
      showMessage('Please enter both username and password', true);
      return;
    }
    
    signinBtn.disabled = true;
    signinBtn.innerHTML = '<span data-feather="loader"></span> Signing in...';
    feather.replace();
    
    try {
      // Try backend login first
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await res.json();
      
      if (data.error) {
        showMessage(data.error, true);
      } else if (data.success || data.username || data.user) {
        // Successful login
        const user = {
          username: data.username || data.user?.username || username,
          role: role,
          ...data
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', user.username);
        
        showMessage('✓ Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = `/dashboard.html?role=${role}`;
        }, 1500);
      } else {
        showMessage('Login successful!');
        setTimeout(() => {
          window.location.href = `/dashboard.html?role=${role}`;
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Fallback authentication
      let loginSuccess = false;
      
      if (role === 'admin' && username === 'admin' && password === 'admin') {
        loginSuccess = true;
      } else if (role === 'student' && password === 'student') {
        loginSuccess = true;
      } else if (role === 'teacher' && password === 'teacher') {
        loginSuccess = true;
      } else if (role === 'parent' && password === 'parent') {
        loginSuccess = true;
      }
      
      if (loginSuccess) {
        localStorage.setItem('user', JSON.stringify({ username, role }));
        localStorage.setItem('userRole', role);
        localStorage.setItem('username', username);
        
        showMessage('✓ Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = `/dashboard.html?role=${role}`;
        }, 1500);
      } else {
        showMessage('Invalid username or password', true);
      }
    } finally {
      signinBtn.disabled = false;
      signinBtn.innerHTML = '<span data-feather="log-in"></span> Sign In';
      feather.replace();
    }
  });
}

// Demo credentials
if (demoBtn) {
  demoBtn.addEventListener('click', () => {
    document.getElementById('signin-role').value = 'student';
    document.getElementById('signin-username').value = '0002';
    document.getElementById('signin-password').value = 'student';
    showMessage('Demo credentials loaded. Click Sign In to continue.');
  });
}

// ===================================
// CONTACT FORM
// ===================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
  });
}

// ===================================
// NEWSLETTER FORM
// ===================================
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    alert(`Thank you for subscribing with ${email}!`);
    newsletterForm.reset();
  });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Animate elements on scroll
document.querySelectorAll('.feature-card, .about-image, .about-content, .vm-card, .contact-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// ===================================
// INITIALIZE
// ===================================
console.log('SchoolPortal landing page loaded successfully!');
