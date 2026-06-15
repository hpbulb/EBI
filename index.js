// document.addEventListener('DOMContentLoaded', () => {
//   const intro = document.getElementById('intro')
//   const t1    = document.getElementById('intro-text-1')
//   const t2    = document.getElementById('intro-text-2')
//   const t3    = document.getElementById('intro-text-3')

//   // staggered zoom-in for each line
//   setTimeout(() => t1.classList.add('animate-zoom-in'), 300)
//   setTimeout(() => t2.classList.add('animate-zoom-in'), 600)
//   setTimeout(() => t3.classList.add('animate-zoom-in'), 900)

//   // slide overlay up to reveal page
//   setTimeout(() => {
//     intro.style.transition = 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)'
//     intro.style.transform  = 'translateY(-100%)'
//     intro.addEventListener('transitionend', () => intro.remove(), { once: true })
//   }, 2800)
// })

const texts = document.querySelectorAll(".intro-text");

window.addEventListener("load", () => {
    texts.forEach((text, index) => {
        setTimeout(() => {
            text.classList.add("show");
        }, index * 900); // delay each item
    });
});

const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
const icon = document.getElementById("menu-icon"); // add this

menuBtn.addEventListener("click", () => {
    menu.classList.toggle("opacity-0");
    menu.classList.toggle("scale-95");
    menu.classList.toggle("-translate-y-2");
    menu.classList.toggle("pointer-events-none");

    if (icon.classList.contains("fa-grip")) {
        icon.classList.remove("fa-grip");
        icon.classList.add("fa-xmark");
    } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-grip");
    }
});
