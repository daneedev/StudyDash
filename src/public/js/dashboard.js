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

document.addEventListener('DOMContentLoaded', function() {
    // Classes sections toggle functionality
    const createdClassesToggle = document.getElementById('createdClassesToggle');
    const joinedClassesToggle = document.getElementById('joinedClassesToggle');
    const createdClasses = document.getElementById('createdClassesGrid');
    const joinedClasses = document.getElementById('joinedClassesGrid');

    // Initialize classes sections state
    // Default to false (visible) if no value is stored
    const createdClassesCollapsed = localStorage.getItem('createdClassesCollapsed') === 'true';
    const joinedClassesCollapsed = localStorage.getItem('joinedClassesCollapsed') === 'true';

    // Apply initial state
    if (createdClassesCollapsed) {
        createdClasses.classList.add('hidden');
        createdClassesToggle.querySelector('i').classList.add('rotate-180');
    }
    if (joinedClassesCollapsed) {
        joinedClasses.classList.add('hidden');
        joinedClassesToggle.querySelector('i').classList.add('rotate-180');
    }

    // Toggle created classes
    createdClassesToggle.addEventListener('click', function() {
        createdClasses.classList.toggle('hidden');
        const icon = this.querySelector('i');
        icon.classList.toggle('rotate-180');
        
        localStorage.setItem('createdClassesCollapsed', createdClasses.classList.contains('hidden'));
    });

    // Toggle joined classes
    joinedClassesToggle.addEventListener('click', function() {
        joinedClasses.classList.toggle('hidden');
        const icon = this.querySelector('i');
        icon.classList.toggle('rotate-180');
        
        localStorage.setItem('joinedClassesCollapsed', joinedClasses.classList.contains('hidden'));
    });
});