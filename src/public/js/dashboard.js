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

document.addEventListener('DOMContentLoaded', function() {
    // ... (keep your existing sidebar and toggle code) ...

    // Generate class cards with unique IDs
    const createdClasses = ["1.A", "1.B"]; 
    const joinedClasses = ["4.C", "3.G", "2.K"]; 
    
    // Helper function to create class cards
    function createClassCard(cls, container, isJoined = false) {
        const uniqueId = `${isJoined ? 'joined' : 'created'}-${Math.random().toString(36).substr(2, 9)}`;
        const html = `
            <div class="relative group">
                <a href="class.html" class="block">
                    <section class="bg-darkgray aspect-square rounded-lg shadow-md flex justify-center items-center p-6 transition-all duration-200 flex-col gap-8 relative hover:scale-98">
                        <div class="absolute top-0 right-0 p-5" data-menu-id="${uniqueId}">
                            <i class="fa-solid fa-ellipsis-vertical text-xl text-text hover:scale-90 cursor-pointer" ></i>
                        </div>
                        <div class="w-3/5 h-3/5 bg-white rounded-lg"></div>
                        <p class="text-2xl font-bold text-text">${cls}</p>
                    </section>
                </a>
                <div id="${uniqueId}" class="hidden absolute top-12 right-3 bg-white rounded shadow-lg z-50 p-2 flex flex-col gap-2 text-sm text-black">
                    <button class="hover:bg-gray-200 rounded px-2 py-1" action = "/class/delete" method = "post">Delete</button>
                    <button class="hover:bg-gray-200 rounded px-2 py-1" action = "/class/leave" method = "post">Leave</button>
                    <button class="hover:bg-gray-200 rounded px-2 py-1">Rename</button>
                    <button class="hover:bg-gray-200 rounded px-2 py-1">Invite</button>
                </div>
            </div>
        `;
        container.innerHTML += html;
    }

    // Create cards for both sections
    const createdClassesContainer = document.getElementById("createdClassesGrid");
    const joinedClassesContainer = document.getElementById("joinedClassesGrid");
    
    createdClasses.forEach(cls => createClassCard(cls, createdClassesContainer));
    joinedClasses.forEach(cls => createClassCard(cls, joinedClassesContainer, true));

    // Menu handling
    document.querySelectorAll('[data-menu-id]').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const menuId = icon.getAttribute('data-menu-id');
            const menu = document.getElementById(menuId);
            const card = icon.closest('.group');

            // Position the menu relative to the card
            if (menu && card) {
                // Close all other menus first
                document.querySelectorAll('[id^="created-"], [id^="joined-"]').forEach(m => {
                    if (m.id !== menuId) m.classList.add('hidden');
                });

                // Position and show the current menu
                menu.classList.toggle('hidden');
                
                // Ensure menu stays within viewport
                const cardRect = card.getBoundingClientRect();
                const menuRect = menu.getBoundingClientRect();
                
                if (cardRect.right + menuRect.width > window.innerWidth) {
                    menu.style.right = 'auto';
                    menu.style.left = '3rem';
                } else {
                    menu.style.right = '0.75rem';
                    menu.style.left = 'auto';
                }
            }
        });
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-menu-id]') && !e.target.closest('[id^="created-"]') && !e.target.closest('[id^="joined-"]')) {
            document.querySelectorAll('[id^="created-"], [id^="joined-"]').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });


    

    // Prevent menu from closing when clicking inside it
    document.querySelectorAll('[id^="created-"], [id^="joined-"]').forEach(menu => {
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Subject handling
    const subjectInput = document.getElementById('subjectInput');
    const addSubjectBtn = document.getElementById('addSubject');
    const subjectsList = document.getElementById('subjectsList');

    function addSubject(subject) {
        if (!subject.trim()) return;
        
        const subjectTag = document.createElement('div');
        subjectTag.className = 'flex items-center gap-2 bg-lightgray/20 rounded-lg px-3 py-2';
        subjectTag.innerHTML = `
            <span class="text-text">${subject}</span>
            <button type="button" class="text-text hover:text-primary transition-colors">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Add remove functionality
        const removeBtn = subjectTag.querySelector('button');
        removeBtn?.addEventListener('click', () => {
            subjectTag.remove();
        });

        subjectsList?.appendChild(subjectTag);
        if (subjectInput) subjectInput.value = '';
    }

    // Add subject on button click
    addSubjectBtn?.addEventListener('click', () => {
        addSubject(subjectInput?.value || '');
    });

    // Add subject on Enter key
    subjectInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubject(subjectInput.value);
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // ... (keep all your existing code until the subject handling section) ...

    // Subject handling
    const subjectInput = document.getElementById('subjectInput');
    const addSubjectBtn = document.getElementById('addSubject');
    const subjectsList = document.getElementById('subjectsList');
    const classNameInput = document.getElementById('className');
    const classPhotoInput = document.getElementById('classPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const previewImage = document.getElementById('previewImage');
    const addClassButton = document.getElementById('addClassButton');
    const detailPopup = document.getElementById('detailPopup');
    const closeDetailPopup = document.getElementById('closeDetailPopup');

    // Handle photo upload preview
    classPhotoInput?.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                photoPreview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        } else {
            photoPreview.classList.add('hidden');
        }
    });

    // Close popup when clicking X
    closeDetailPopup?.addEventListener('click', function() {
        detailPopup.classList.add('hidden');
    });

    // Close popup when clicking outside
    detailPopup?.addEventListener('click', function(e) {
        if (e.target === detailPopup) {
            detailPopup.classList.add('hidden');
        }
    });

    // Function to add a subject tag
    function addSubject(subject) {
        if (!subject.trim()) return;
        
        const subjectTag = document.createElement('div');
        subjectTag.className = 'flex items-center gap-2 bg-lightgray/20 rounded-lg px-3 py-2';
        subjectTag.innerHTML = `
            <span class="text-text">${subject}</span>
            <button type="button" class="text-text hover:text-primary transition-colors">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        // Add remove functionality
        const removeBtn = subjectTag.querySelector('button');
        removeBtn?.addEventListener('click', () => {
            subjectTag.remove();
        });

        subjectsList?.appendChild(subjectTag);
        if (subjectInput) subjectInput.value = '';
    }

    // Add subject on button click
    addSubjectBtn?.addEventListener('click', () => {
        addSubject(subjectInput?.value || '');
    });

    // Add subject on Enter key
    subjectInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSubject(subjectInput.value);
        }
    });

    // Create new class when Add button is clicked
    addClassButton?.addEventListener('click', function(e) {
        e.preventDefault();
        
        const className = classNameInput?.value.trim();
        if (!className) {
            alert('Please enter a class name');
            return;
        }

        // Create the new class card
        const createdClassesContainer = document.getElementById("createdClassesGrid");
        if (createdClassesContainer) {
            const uniqueId = `created-${Math.random().toString(36).substr(2, 9)}`;
            const html = `
                <div class="relative group">
                    <a href="class.html" class="block">
                        <section class="bg-darkgray aspect-square rounded-lg shadow-md flex justify-center items-center p-6 transition-all duration-200 flex-col gap-8 relative hover:scale-98">
                            <div class="absolute top-0 right-0 p-5" data-menu-id="${uniqueId}">
                                <i class="fa-solid fa-ellipsis-vertical text-xl text-text hover:scale-90 cursor-pointer"></i>
                            </div>
                            <div class="w-3/5 h-3/5 bg-white rounded-lg">
                                ${classPhotoInput.files.length > 0 ? 
                                    `<img src="${URL.createObjectURL(classPhotoInput.files[0])}" class="w-full h-full object-cover rounded-lg" alt="Class photo">` : 
                                    ''}
                            </div>
                            <p class="text-2xl font-bold text-text">${className}</p>
                        </section>
                    </a>
                    <div id="${uniqueId}" class="hidden absolute top-12 right-3 bg-white rounded shadow-lg z-50 p-2 flex flex-col gap-2 text-sm text-black">
                        <button class="hover:bg-gray-200 rounded px-2 py-1" action="/class/delete" method="post">Delete</button>
                        <button class="hover:bg-gray-200 rounded px-2 py-1" action="/class/leave" method="post">Leave</button>
                        <button class="hover:bg-gray-200 rounded px-2 py-1">Rename</button>
                        <button class="hover:bg-gray-200 rounded px-2 py-1">Invite</button>
                    </div>
                </div>
            `;
            
            createdClassesContainer.innerHTML += html;

            // Add event listeners to the new menu
            const menuIcon = createdClassesContainer.lastElementChild.querySelector('[data-menu-id]');
            if (menuIcon) {
                menuIcon.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const menuId = this.getAttribute('data-menu-id');
                    const menu = document.getElementById(menuId);
                    const card = this.closest('.group');

                    if (menu && card) {
                        // Close all other menus first
                        document.querySelectorAll('[id^="created-"], [id^="joined-"]').forEach(m => {
                            if (m.id !== menuId) m.classList.add('hidden');
                        });

                        // Position and show the current menu
                        menu.classList.toggle('hidden');
                        
                        // Ensure menu stays within viewport
                        const cardRect = card.getBoundingClientRect();
                        const menuRect = menu.getBoundingClientRect();
                        
                        if (cardRect.right + menuRect.width > window.innerWidth) {
                            menu.style.right = 'auto';
                            menu.style.left = '3rem';
                        } else {
                            menu.style.right = '0.75rem';
                            menu.style.left = 'auto';
                        }
                    }
                });
            }
        }

        // Reset form and close popup
        if (classNameInput) classNameInput.value = '';
        if (classPhotoInput) classPhotoInput.value = '';
        if (photoPreview) photoPreview.classList.add('hidden');
        if (subjectsList) subjectsList.innerHTML = '';
        if (detailPopup) detailPopup.classList.add('hidden');
    });

    // Show popup when plus button is clicked
    const createClassButton = document.querySelector('button[action="/class/create"]');
    createClassButton?.addEventListener('click', function(e) {
        e.preventDefault();
        detailPopup.classList.remove('hidden');
    });
});