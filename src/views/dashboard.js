document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sideBar = document.getElementById('sideBar');
    const menuIcon = menuToggle.querySelector('i');
    
    const isCollapsed = localStorage.getItem('sideBarCollapsed') === 'false';
    
    
    if (isCollapsed === true) {
        sideBar.classList.add('hidden');
        menuIcon.classList.replace('fa-xmark', 'fa-bars');
    }
    
    menuToggle.addEventListener('click', function() {
        sideBar.classList.toggle('hidden');
        
        
        if (sideBar.classList.contains('hidden')) {
            menuIcon.classList.replace('fa-xmark', 'fa-bars');
            localStorage.setItem('sideBarCollapsed', 'true');
        } else {
            menuIcon.classList.replace('fa-bars', 'fa-xmark');
            localStorage.setItem('sideBarCollapsed', 'false');
        }
    });
});