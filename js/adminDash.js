
const day = document.getElementById("time");
const sunIco = document.getElementById("icon")
const hour = new Date().getHours();

if (hour < 12) {
    day.textContent = "Good Morning";
    sunIco.classList.add = "'fa-regular', 'fa-sun'"
} else if (hour >= 12) {
    day.textContent = "Good Afternoon";
} else {
    day.textContent = "Good Evening";
}

