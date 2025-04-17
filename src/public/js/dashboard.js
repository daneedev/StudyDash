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

    
    const createdClassesCollapsed = localStorage.getItem('createdClassesCollapsed') === 'true';
    const joinedClassesCollapsed = localStorage.getItem('joinedClassesCollapsed') === 'true';

    
    if (createdClassesCollapsed) {
        createdClasses.classList.add('hidden');
        createdClassesToggle.querySelector('i').classList.add('rotate-180');
    }
    if (joinedClassesCollapsed) {
        joinedClasses.classList.add('hidden');
        joinedClassesToggle.querySelector('i').classList.add('rotate-180');
    }

    
    createdClassesToggle.addEventListener('click', function() {
        createdClasses.classList.toggle('hidden');
        const icon = this.querySelector('i');
        icon.classList.toggle('rotate-180');
        
        localStorage.setItem('createdClassesCollapsed', createdClasses.classList.contains('hidden'));
    });

    
    joinedClassesToggle.addEventListener('click', function() {
        joinedClasses.classList.toggle('hidden');
        const icon = this.querySelector('i');
        icon.classList.toggle('rotate-180');
        
        localStorage.setItem('joinedClassesCollapsed', joinedClasses.classList.contains('hidden'));
    });



    const classes = ["1.A", "1.B",]; 

    const container = document.getElementById("createdClassesGrid"); 

    classes.forEach(cls => {
        const html = `
            <a href="class.html">
                <section class="bg-darkgray aspect-square rounded-lg shadow-md flex justify-center items-center p-6 transition-all duration-200 flex-col gap-8 relative hover:scale-98">
                    <div class="absolute top-3 right-3">
                        <i class="fa-solid fa-ellipsis-vertical text-xl text-text hover:scale-90"></i>
                    </div>
                    <div class="w-3/5 h-3/5 bg-white rounded-lg"></div>
                    <p class="text-2xl font-bold text-text">${cls}</p>
                </section>
            </a>
        `;
        container.innerHTML += html;
});
});