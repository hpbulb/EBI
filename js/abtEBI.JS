    const observerOptions = {
    threshold: 0.1 // Triggers when 10% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop observing once the animation is done
            observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

// Select all elements with the animation class
document.querySelectorAll('.info-des').forEach(el => {
    observer.observe(el);
});

    onclick=document.getElementById("con").style.display="block" ;