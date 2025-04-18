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

});

const createdClasses = ["1.A", "1.B"]; 
const createdClassesContainer = document.getElementById("createdClassesGrid"); 

const joinedClasses = ["4.C", "3.G", "2.K"]; 
const joinedClassesContainer = document.getElementById("joinedClassesGrid"); 

createdClasses.forEach((cls, index) => {
    const html = `
        <a href="class.html" class="relative group block">
            <section class="bg-darkgray aspect-square rounded-lg shadow-md flex justify-center items-center p-6 transition-all duration-200 flex-col gap-8 relative hover:scale-98">
                <div class="absolute top-3 right-3 m-2">
                    <i class="fa-solid fa-ellipsis-vertical text-xl text-text hover:scale-90 cursor-pointer" data-menu-id="menu-${index}"></i>
                </div>
                <div class="w-3/5 h-3/5 bg-white rounded-lg"></div>
                <p class="text-2xl font-bold text-text">${cls}</p>
            </section>
            <div id="menu-${index}" class="hidden absolute top-10 right-3 bg-white rounded shadow-lg z-50 p-2 flex flex-col gap-2 text-sm text-black">
                <button class="hover:bg-gray-200 rounded px-2 py-1">Delete</button>
                <button class="hover:bg-gray-200 rounded px-2 py-1">Leave</button>
                <button class="hover:bg-gray-200 rounded px-2 py-1">Rename</button>
            </div>
        </a>
    `;
    createdClassesContainer.innerHTML += html;
});

joinedClasses.forEach((cls, index) => {
    const html = `
        <a href="class.html" class="relative group block">
            <section class="bg-darkgray aspect-square rounded-lg shadow-md flex justify-center items-center p-6 transition-all duration-200 flex-col gap-8 relative hover:scale-98">
                <div class="absolute top-3 right-3 m-2">
                    <i class="fa-solid fa-ellipsis-vertical text-xl text-text hover:scale-90 cursor-pointer" data-menu-id="menu-${index}"></i>
                </div>
                <div class="w-3/5 h-3/5 bg-white rounded-lg"></div>
                <p class="text-2xl font-bold text-text">${cls}</p>
            </section>
            <div id="menu-${index}" class="hidden absolute top-10 right-3 bg-white rounded shadow-lg z-50 p-2 flex flex-col gap-2 text-sm text-black">
                <button class="hover:bg-gray-200 rounded px-2 py-1">Delete</button>
                <button class="hover:bg-gray-200 rounded px-2 py-1">Leave</button>
                <button class="hover:bg-gray-200 rounded px-2 py-1">Rename</button>
            </div>
        </a>
    `;
    joinedClassesContainer.innerHTML += html;
});

// Add event listeners after creating the elements
document.addEventListener('DOMContentLoaded', () => {
    // Handle click on ellipsis icons
    document.querySelectorAll('[data-menu-id]').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const menuId = icon.getAttribute('data-menu-id');
            const menu = document.getElementById(menuId);

            // Toggle the current menu
            const isHidden = menu.classList.contains('hidden');
            document.querySelectorAll('[id^="menu-"]').forEach(m => {
                m.classList.add('hidden'); // Close all menus
            });

            if (isHidden) {
                menu.classList.remove('hidden'); // Open the clicked menu
            }
        });
    });

    // Close menus when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-menu-id]') && !e.target.closest('[id^="menu-"]')) {
            document.querySelectorAll('[id^="menu-"]').forEach(menu => {
                menu.classList.add('hidden'); // Close all menus
            });
        }
    });

    // Prevent menu from closing when clicking inside it
    document.querySelectorAll('[id^="menu-"]').forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from propagating to the document
        });
    });
});

