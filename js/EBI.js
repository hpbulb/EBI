//       const btn = document.getElementById("menu-btn");
//       const menu = document.getElementById("menu");
//       const icon = btn.querySelector("i");
//       const serRed = document.getElementById("serRed");
//       const Por = document.getElementById("Por");
//       const show = document.getElementById("show_text");
//       const text = document.getElementById("text");


//       btn.addEventListener("click", () => {
//         menu.classList.toggle("opacity-0");
//         menu.classList.toggle("scale-95");
//         menu.classList.toggle("-translate-y-5");
//         menu.classList.toggle("pointer-events-none");

//         if (icon.classList.contains("fa-ellipsis")) {
//           icon.classList.remove("fa-ellipsis");
//           icon.classList.add("fa-xmark");
//         } else {
//           icon.classList.remove("fa-xmark");
//           icon.classList.add("fa-ellipsis");
//         }
//       });
      
//   info = document.getElementById("info");

//   info.addEventListener("click", () => {
//     window.alert(`Would you like to view the proprietress wlecome message?`)
//       window.location.href = "#portfolioPage";
//    info.scrollIntoView({behavior: "smooth"}) 
//   });
// document.addEventListener("DOMContentLoaded", () => {
//             const text = "Welcome to Eden Bulb International Schools";
//             const speed = 100; 
//             let i = 0;
//             const target = document.getElementById("typewritter");

//             // Safety check: make sure JavaScript actually found the element
//             if (!target) {
//                 console.error("Could not find the element with ID 'typewritter'");
//                 return;
//             }

//             function typeWritter() {
//                 if (i < text.length) {
//                     target.innerHTML += text.charAt(i);
//                     i++;
//                     setTimeout(typeWritter, speed);
//                 }
//             }

//             // Fire the function
//             typeWritter();
//         });

const btn1 = document.getElementById(`btn1`);
const btn2 = document.getElementById(`btn2`);
const stu = document.getElementById(`Stu`)
 
btn1.addEventListener("click", () => {
  window.alert(`Your being redirected to the school about page`)
  window.location.href = "abtEBI.html";
});

btn2.addEventListener("click", () => {
  window.location.href = "EBI_REG.html"
});

stu.addEventListener("click", () => {
  window.alert(`Have You Enrolled`)
  window.location.href = "login.php";
});
