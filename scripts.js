let autoScrollInterval = null;
    const root = document.documentElement;

    function stopAutoScroll() {
        if (autoScrollInterval) {
            cancelAnimationFrame(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    //Scroll Animation
    function smoothScrollTo(targetY, duration) {
        stopAutoScroll(); 
        const startY = window.scrollY;
        const distance = targetY - startY;
        let startTimestamp = null;

    function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = timestamp - startTimestamp;
        const percentage = Math.min(progress / duration, 1);
        
    
        const easing = 1 - Math.pow(1 - percentage, 3);
        window.scrollTo(0, startY + (distance * easing));

        if (progress < duration) {
            autoScrollInterval = requestAnimationFrame(step);
        } else {
            autoScrollInterval = null;
        }
    }
    autoScrollInterval = requestAnimationFrame(step);
}


    window.addEventListener('wheel', stopAutoScroll, { passive: true });
    window.addEventListener('touchmove', stopAutoScroll, { passive: true });

    // Section 1: Continue Button
    const continueBtn = document.querySelector('.continue_prompt_container');
    continueBtn.addEventListener('click', () => {
        smoothScrollTo(window.innerHeight, 2000);
    });
    // Section 2: Logo Button (Back to Top)
    const logoBtn = document.getElementById("back_to_top");
    logoBtn.addEventListener('click', () => {
        smoothScrollTo(0, 2000);
    });


    // Opacity and Lights
    window.addEventListener('scroll', () => {
    const scrollFraction = Math.min(window.scrollY / window.innerHeight, 1);
    

    const newDarkness = 0.5 + (scrollFraction * 0.3);
    root.style.setProperty('--scroll-opacity', newDarkness);

    const glowTrigger = scrollFraction; 
    root.style.setProperty('--glow-opacity', glowTrigger);
    
    const continueBtnContainer = document.querySelector('.continue_prompt_container');
    continueBtnContainer.style.opacity = 1 - (scrollFraction * 2); 
    });

    // Social Links Animation
    const socialLinks = document.querySelectorAll('.socials a');
    socialLinks.forEach((link, index) => {
    link.style.animationDelay = `${index * 0.2}s`;
    link.classList.add('animate');
    });

    // Dynamic Content Box
    const navItems = document.querySelectorAll('.nav_item');
const screens = document.querySelectorAll('.content_screen');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target');

        // Check if targetId exists to prevent errors
        if (!targetId) return;

        // Remove active from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Remove active from all content screens
        screens.forEach(screen => screen.classList.remove('active'));

        // Set clicked item and its target screen to active
        item.classList.add('active');
        const targetScreen = document.getElementById(targetId.toLowerCase());
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    });
});