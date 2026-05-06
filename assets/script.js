/* Tu archivo assets/script.js completo y modificado */

document.addEventListener('DOMContentLoaded', function() {
  // ================================
  // Mobile Menu Toggle (con slide y backdrop)
  // ================================
  const menuToggle   = document.getElementById('menuToggle');
  const mobileMenu   = document.getElementById('mobileMenu');
  const menuBackdrop = document.getElementById('menuBackdrop'); // <div class="menu-backdrop" id="menuBackdrop"></div>

  function closeMenu() {
    if (mobileMenu)   mobileMenu.classList.remove('active');
    if (menuBackdrop) menuBackdrop.classList.remove('active');
  }

  function toggleMenu() {
    if (!mobileMenu || !menuBackdrop) return;
    const isOpen = mobileMenu.classList.toggle('active');
    menuBackdrop.classList.toggle('active', isOpen);
  }

  if (menuToggle && mobileMenu && menuBackdrop){
    // abrir / cerrar con el botón hamburguesa
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // cerrar al clickear cualquier link del menú
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => closeMenu())
    );

    // cerrar tocando fuera (la mitad derecha de la pantalla)
    menuBackdrop.addEventListener('click', closeMenu);
  }

  // ================================
  // Hero Slider
  // ================================
  let currentSlide = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');

  function showSlide(index) {
    if (!slides.length || !dots.length) return; 
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  if (slides.length > 0) {
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'));
        showSlide(slideIndex);
      });
    });
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  // ================================
  // Smooth scrolling for anchor links
  // ================================
  document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      let targetId = this.getAttribute('href');
      if (targetId.startsWith('/#')) {
        targetId = targetId.substring(1); 
      }
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        // cerrar menú móvil si estaba abierto
        if (mobileMenu)   mobileMenu.classList.remove('active');
        if (menuBackdrop) menuBackdrop.classList.remove('active');
      }
    });
  });

  // ================================
  // Modal de Postulación (abrir/cerrar)
  // ================================
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const applicationModal = document.getElementById('applicationModal');

  function openModal(e) {
    if (e) e.preventDefault();
    if (applicationModal) {
      applicationModal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  function closeModal() {
    if (applicationModal) {
      applicationModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (applicationModal) {
    applicationModal.addEventListener('click', (event) => {
      if (event.target === applicationModal) closeModal();
    });
    document.querySelectorAll('.event-btn').forEach(btn => {
      btn.addEventListener('click', openModal);
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-label', 'Postularse al evento');
    });
  }

  // ================================
  // Formulario de Postulación - Envío a Google Sheets
  // ================================
  const postulacionForm = document.getElementById('applicationForm');
  if (postulacionForm) {
    postulacionForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitPostulacion');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      const datos = {
        nombre:    document.getElementById('nombre').value.trim(),
        correo:    document.getElementById('correo').value.trim(),
        whatsapp:  document.getElementById('whatsapp').value.trim(),
        instagram: document.getElementById('instagram').value.trim(),
        mensaje:   document.getElementById('mensaje').value.trim()
      };

      try {
        const params = new URLSearchParams(datos).toString();
        await fetch(
          'https://script.google.com/macros/s/AKfycbyJ3ujZgG26mc56TzXligLwWTqdRusoMtcMi3Bn8RVgRHlnqGRE0Iw3N2pXpIOREYop2w/exec?' + params,
          { method: 'GET', mode: 'no-cors' }
        );
        postulacionForm.style.display = 'none';
        const successMsg = document.getElementById('form-success-message');
        if (successMsg) successMsg.style.display = 'block';
      } catch (err) {
        alert('Hubo un error al enviar. Por favor intentá de nuevo.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Postulación';
      }
    });
  }

  // ================================
  // Formulario de Contacto - Envío de Mensajes
  // ================================
  const contactForm = document.getElementById('messageForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const messageInput = document.getElementById('message-input');
      const nombreInput = document.getElementById('nombre-input');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      // Validación básica
      if (!messageInput.value.trim() || !nombreInput.value.trim()) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
      }

      // Deshabilitar botón mientras envía
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      // Datos a enviar
      const formData = {
        message: messageInput.value.trim(),
        nombre: nombreInput.value.trim(),
      };

      try {
        // URL de tu API
        const apiUrl = 'https://script.google.com/macros/s/AKfycbylumG7o0d-ZilviTDlR0vc17MiyVgznTZHhk4AZg1aBsklV6ByG6mPCEsxg9SeaKwI/exec';
        const response = await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        // Con mode: 'no-cors', siempre se considera exitoso
        alert('¡Mensaje enviado con éxito!');
        contactForm.reset(); // Limpiar el formulario

        // Recargar los mensajes después de enviar
        setTimeout(() => {
          cargarMensajes();
        }, 2000);

      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        alert('Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
      } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      }
    });
  }

  // ================================
  // Lightbox de galería (gallery.html)
  // ================================
  (function ensureLightbox() {
    if (document.getElementById('lightbox')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog">
        <div class="lightbox-inner" id="lightboxInner">
          <button class="lightbox-btn lb-prev" id="lbPrev" aria-label="Foto anterior">
            <i class="fas fa-chevron-left" aria-hidden="true"></i>
          </button>
          <img class="lightbox-img" id="lbImg" alt="Foto ampliada">
          <button class="lightbox-btn lb-next" id="lbNext" aria-label="Foto siguiente">
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </button>
          <button class="lb-close" id="lbClose" aria-label="Cerrar">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
          <!-- Botones de acción de la foto -->
          <div class="lb-actions" id="lbActions">
            <button class="lb-action-btn" id="lbDownload" title="Descargar imagen">
              <i class="fas fa-download"></i>
              <span>Descargar</span>
            </button>
            <button class="lb-action-btn" id="lbCopyLink" title="Copiar link">
              <i class="fas fa-link"></i>
              <span>Copiar link</span>
            </button>
          </div>
          <!-- Tooltip de éxito -->
          <div class="lb-copy-tooltip" id="lbCopyTooltip">¡Link copiado!</div>
        </div>
      </div>`;
    document.body.appendChild(wrapper.firstElementChild);
  })();

  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbInner = document.getElementById('lightboxInner');
  const btnPrev = document.getElementById('lbPrev');
  const btnNext = document.getElementById('lbNext');
  const btnClose = document.getElementById('lbClose');
  const btnDownload = document.getElementById('lbDownload');
  const btnCopyLink = document.getElementById('lbCopyLink');
  const copyTooltip = document.getElementById('lbCopyTooltip');
  let images = [];
  let imageFigures = [];
  let idx = 0;
  let touchStartX = null;

  function collectImages() {
    images = Array.from(document.querySelectorAll('.photos img'));
    imageFigures = Array.from(document.querySelectorAll('.photos .photo'));
  }

  function openAt(i) {
    if (!images.length) collectImages();
    if (!images.length) return;
    idx = (i + images.length) % images.length;
    const el = images[idx];
    const figure = imageFigures[idx];
    const src = el.getAttribute('src');
    const alt = el.getAttribute('alt') || '';
    lbImg.src = src;
    lbImg.alt = alt;

    // Guardar datos de la foto actual para descargar y copiar link
    if (figure) {
      lbImg.dataset.photoUrl = figure.dataset.photoUrl || '';
      lbImg.dataset.photoSrc = figure.dataset.photoSrc || src;
    }

    lb.classList.add('active');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeLb() {
    lb.classList.remove('active');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    lbImg.removeAttribute('src'); // liberar memoria
  }

  function prev() { openAt(idx - 1); }
  function next() { openAt(idx + 1); }

  document.addEventListener('click', (e) => {
    const img = e.target.closest('.photos img');
    if (!img) return;
    collectImages();
    if (img) img.style.cursor = 'zoom-in';
    const i = images.indexOf(img);
    if (i >= 0) openAt(i);
  });

  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  if (btnClose) btnClose.addEventListener('click', (e) => { e.stopPropagation(); closeLb(); });

  // Botón de descargar imagen
  if (btnDownload) {
    btnDownload.addEventListener('click', async (e) => {
      e.stopPropagation();
      const src = lbImg.dataset.photoSrc || lbImg.src;
      if (!src) return;

      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = src.split('/').pop() || 'foto.webp';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error al descargar:', err);
        alert('No se pudo descargar la imagen');
      }
    });
  }

  // Botón de copiar link
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', async (e) => {
      e.stopPropagation();
      const url = lbImg.dataset.photoUrl;
      if (!url) return;

      try {
        await navigator.clipboard.writeText(url);
        copyTooltip.classList.add('show');
        btnCopyLink.classList.add('copied');

        setTimeout(() => {
          copyTooltip.classList.remove('show');
          btnCopyLink.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el link');
      }
    });
  }

  lb.addEventListener('click', (e) => {
    if (!lbInner.contains(e.target)) closeLb();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  lb.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lb.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { if (dx > 0) prev(); else next(); }
    touchStartX = null;
  }, { passive: true });
  
  // ================================
  // Cargar Mensajes (Felicitaciones)
  // ================================
  cargarMensajes();
  
}); // <-- FIN DEL document.addEventListener('DOMContentLoaded')


// ======================================================
// Función para cargar mensajes desde la API
// ======================================================
async function cargarMensajes() {
  const contenedor = document.querySelector('.Mensajes-grid');

  if (!contenedor) {
    return;
  }

  const urlDeLaApi = 'https://script.google.com/macros/s/AKfycbylumG7o0d-ZilviTDlR0vc17MiyVgznTZHhk4AZg1aBsklV6ByG6mPCEsxg9SeaKwI/exec';
  
  contenedor.innerHTML = '<p>Cargando felicitaciones...</p>';

  try {
    const respuesta = await fetch(urlDeLaApi);
    if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);
    
    const data = await respuesta.json();
    const mensajes = data.mensajes;
    console.log(mensajes);

    if (mensajes.length === 0) {
      contenedor.innerHTML = '<p>Aún no hay felicitaciones para mostrar.</p>';
      return;
    }

    contenedor.innerHTML = ''; // Limpia el "cargando"

    mensajes.slice().reverse().forEach(mensaje => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'Mensaje-card';

      tarjeta.innerHTML = `
        <p class="Mensaje-quote">
          "${mensaje[0]}"
        </p>
        <div class="Mensaje-author">
          <div class="author-name">${mensaje[1]}</div>
        </div>
      `;

  contenedor.appendChild(tarjeta);
});


  } catch (error) {
    console.error('Falló la carga de mensajes:', error);
    contenedor.innerHTML = '<p>No se pudieron cargar las felicitaciones. Por favor, intente más tarde.</p>';
  }
}
