document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    var loadingScreen = document.getElementById("loading-screen");
    var content = document.querySelector(".content");

    if (loadingScreen) {
      loadingScreen.style.transition = "opacity 0.5s";
      loadingScreen.style.opacity = 0;

      setTimeout(function () {
        loadingScreen.style.display = "none";
        if (content) {
          content.style.display = "block";
          content.style.opacity = 0;
          content.style.transition = "opacity 0.5s";
          setTimeout(function () {
            content.style.opacity = 1;
          }, 10); // alternatif pengganti requestAnimationFrame
        }
      }, 500);
    }
  }, 1500);
});

// var icon = document.getElementById('modeIcon');

//   function toggleTheme() {
//     document.body.classList.toggle('dark-mode');
//       if (document.body.classList.contains('dark-mode')) {
//         icon.className = icon.className.replace('fa-moon', 'fa-sun');
//       } else {
//         icon.className = icon.className.replace('fa-sun', 'fa-moon');
//       }
//   }

function sendToWhatsApp(e) {
  e.preventDefault();
  var name = document.getElementById('name').value.trim();
  var message = document.getElementById('message').value.trim();
  var waNumber = '6285738159689';
  var waMsg = encodeURIComponent("Halo Ensaglow!\nNama: " + name + "\nPesan: " + message);
  window.open("https://wa.me/" + waNumber + "?text=" + waMsg, "_blank");
}

    ScrollReveal().reveal('#produk', {
      delay: 200,
      distance: '50px',
      origin: 'bottom',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#kenapa-ensaglow', {
      delay: 200,
      distance: '50px',
      origin: 'left',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#tentang', {
      delay: 200,
      distance: '50px',
      origin: 'right',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#testimoni', {
      delay: 200,
      distance: '50px',
      origin: 'bottom',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });    
    ScrollReveal().reveal('#faq', {
      delay: 200,
      distance: '50px',
      origin: 'left',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#galeri', {
      delay: 200,
      distance: '50px',
      origin: 'right',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#kontak', {
      delay: 200,
      distance: '50px',
      origin: 'left',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#maps', {
      delay: 200,
      distance: '50px',
      origin: 'right',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });
    ScrollReveal().reveal('#footer', {
      delay: 200,
      distance: '50px',
      origin: 'bottom',
      duration: 1000,
      easing: 'ease-in-out',
      reset: true,
    });