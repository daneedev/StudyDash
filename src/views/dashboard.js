document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sideBar = document.getElementById('sideBar');
    const menuIcon = menuToggle.querySelector('i');
    
    // Check if sideBar state is saved in localStorage
    const isCollapsed = localStorage.getItem('sideBarCollapsed') === 'false';
    
    // Set initial state
    if (isCollapsed === true) {
        sideBar.classList.add('hidden');
        menuIcon.classList.replace('fa-bars', 'fa-xmark');
    }
    
    menuToggle.addEventListener('click', function() {
        sideBar.classList.toggle('hidden');
        
        // Toggle between bars and xmark icons
        if (sideBar.classList.contains('hidden')) {
            menuIcon.classList.replace('fa-bars', 'fa-xmark');
            localStorage.setItem('sideBarCollapsed', 'true');
        } else {
            menuIcon.classList.replace('fa-xmark', 'fa-bars');
            localStorage.setItem('sideBarCollapsed', 'false');
        }
    });
});