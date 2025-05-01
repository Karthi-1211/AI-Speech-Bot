document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  
    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
        }
      });
    });
  
    // Particle effect for hero background
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const particles = [];
      const particleCount = 50;
      
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 5 + 2;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x > canvas.width) this.x = 0;
          if (this.x < 0) this.x = canvas.width;
          if (this.y > canvas.height) this.y = 0;
          if (this.y < 0) this.y = canvas.height;
        }
        draw() {
          ctx.fillStyle = 'rgba(0, 221, 235, 0.5)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });
        requestAnimationFrame(animate);
      }
      animate();
      
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }
  
    // Form submission handling
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const feedbackMessage = document.getElementById('feedback-message');
        
        feedbackMessage.style.display = 'block';
        feedbackMessage.textContent = 'Submitting...';
        feedbackMessage.style.color = '#ffd700';
        
        fetch(this.action, {
          method: this.method,
          body: new FormData(this),
          headers: {
            'Accept': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            feedbackMessage.textContent = 'Submission successful';
            feedbackMessage.style.color = '#00cc00';
            this.reset();
            setTimeout(() => {
              feedbackMessage.style.display = 'none';
            }, 3000);
          } else {
            feedbackMessage.textContent = 'Error: ' + (data.message || 'Failed to submit. Please try again.');
            feedbackMessage.style.color = '#ff4c4c';
            setTimeout(() => {
              feedbackMessage.style.display = 'none';
            }, 5000);
          }
        })
        .catch(error => {
          feedbackMessage.textContent = 'Error: Failed to submit. Check your internet connection or contact support.';
          feedbackMessage.style.color = '#ff4c4c';
          setTimeout(() => {
            feedbackMessage.style.display = 'none';
          }, 5000);
        });
      });
    }
  });