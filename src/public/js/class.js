document.addEventListener('DOMContentLoaded', () => {
    
    const plusButton = document.getElementById('plusButton');
    const plusMenu = document.getElementById('plusMenu');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');
    const notesButton = plusMenu?.querySelector('button:nth-child(1)'); 
    const homeworkButton = plusMenu?.querySelector('button:nth-child(2)'); 
    const testButton = plusMenu?.querySelector('button:nth-child(3)'); 
    const eventButton = plusMenu?.querySelector('button:nth-child(4)'); 
    const popupTitle = document.getElementById('popupTitle');


    const homeworkTitle = document.getElementById('homeworkTitle');
    const homeworkDate = document.getElementById('homeworkDate');
    const homeworkSubject = document.getElementById('homeworkSubject');
    const homeworkNotes = document.getElementById('homeworkNotes');

    
    plusButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        plusMenu?.classList.toggle('hidden');
    });

    
    document.addEventListener('click', () => {
        plusMenu?.classList.add('hidden');
    });

    
    plusMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    
    notesButton?.addEventListener('click', () => {
        popup?.classList.remove('hidden'); 
        plusMenu?.classList.add('hidden'); 
        popupTitle.innerText = 'Přidat poznámku';
    });
    homeworkButton?.addEventListener('click', () => {
        popup?.classList.remove('hidden'); 
        plusMenu?.classList.add('hidden'); 
        popupTitle.innerText = 'Přidat úkol';
    });
    testButton?.addEventListener('click', () => {
        popup?.classList.remove('hidden'); 
        plusMenu?.classList.add('hidden'); 
        popupTitle.innerText = 'Přidat test';
    });
    eventButton?.addEventListener('click', () => {
        popup?.classList.remove('hidden'); 
        plusMenu?.classList.add('hidden'); 
        popupTitle.innerText = 'Přidat událost';
    });

    
    closePopup?.addEventListener('click', () => {
        popup?.classList.add('hidden');
    });

    // Gauge chart logika
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    const completion = 92;

    const gaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hotovo', 'Zbývá'],
            datasets: [{
                data: [completion, 100 - completion],
                backgroundColor: ['#F5C518', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: false
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw(chart, args, options) {
                const { width, height, ctx } = chart;

                ctx.save();
                const text = `${completion}%`; 
                ctx.font = 'bold 3rem sans-serif';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(text, width / 2, height / 1.2);
                ctx.restore();
            }
        }]
    });

    // Form submission handler
    const form = document.querySelector('form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = homeworkTitle?.value;
        const date = homeworkDate?.value;
        const subject = homeworkSubject?.value;
        const notes = homeworkNotes?.value;
        
        // Create new row
        const newRow = document.createElement('div');
        newRow.className = 'contents group hover:cursor-pointer';
        
        // Format date to DD.M format
        const formattedDate = new Date(date).toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'numeric'
        });

        // Determine which section to add to based on popup title
        let targetSection;
        switch(popupTitle?.innerText) {
            case 'Přidat poznámku':
                targetSection = document.querySelector('.poznámky');
                newRow.innerHTML = createNoteRow(formattedDate, subject, title, notes);
                break;
            case 'Přidat test':
                targetSection = document.querySelector('.testy');
                newRow.innerHTML = createLogRow(formattedDate, subject, title);
                break;
            case 'Přidat úkol':
                targetSection = document.querySelector('.ukoly');
                newRow.innerHTML = createLogRow(formattedDate, subject, title);
                break;
            default:
                return;
        }

        // Add new row to appropriate section
        targetSection?.appendChild(newRow);
        
        // Add click handler to the new row
        addRowClickHandler(newRow);

        // Reset form and close popup
        form.reset();
        popup?.classList.add('hidden');
    });

    // Helper functions to create different row types
    function createNoteRow(date, subject, title, notes) {
        return `
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200 first:rounded-l-lg">${date}</p>
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200">${subject}</p>
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200">${title}</p>
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200 last:rounded-r-lg truncate">${notes}</p>
        `;
    }

    function createLogRow(date, subject, title) {
        return `
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200 first:rounded-l-lg">${date}</p>
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200">${subject}</p>
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200">${title}</p>
            <p class="text-text text-lg p-2 group-hover:bg-lightgray/30 transition-colors duration-200 last:rounded-r-lg">
                <i class="fa-solid fa-xmark text-primary"></i>
            </p>
        `;
    }

    const fileUpload = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');

    fileUpload?.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        
        files.forEach(file => {
            // Create file element
            const fileElement = document.createElement('div');
            fileElement.className = 'flex items-center gap-2 bg-lightgray rounded-lg p-2';
            
            // Create file content
            fileElement.innerHTML = `
                <i class="fa-regular fa-file text-text"></i>
                <span class="text-text text-sm truncate max-w-[200px]">${file.name}</span>
                <button type="button" class="text-text hover:text-primary transition-colors ml-2">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            
            // Add remove functionality
            const removeButton = fileElement.querySelector('button');
            removeButton?.addEventListener('click', () => {
                fileElement.remove();
            });
            
            // Add to file list
            fileList?.appendChild(fileElement);
        });
    });

    // Add drag and drop support
    const dropZone = document.querySelector('label[for="fileUpload"]');

    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-primary');
    });

    dropZone?.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-primary');
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary');
        
        const files = Array.from(e.dataTransfer?.files || []);
        if (fileUpload) {
            // Create a new FileList object
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            fileUpload.files = dataTransfer.files;
            
            // Trigger change event
            const event = new Event('change');
            fileUpload.dispatchEvent(event);
        }
    });

    // Get detail popup elements
    const detailPopup = document.getElementById('detailPopup');
    const closeDetailPopup = document.getElementById('closeDetailPopup');
    const detailTitle = document.getElementById('detailTitle');
    const detailDate = document.getElementById('detailDate');
    const detailSubject = document.getElementById('detailSubject');
    const detailStatus = document.getElementById('detailStatus');
    const detailDescription = document.getElementById('detailDescription');
    const detailFiles = document.getElementById('detailFiles');

    // Move the click handler logic into a reusable function
    function addRowClickHandler(row) {
        row.addEventListener('click', () => {
            // Get data from row
            const date = row.querySelector('p:nth-child(1)').textContent;
            const subject = row.querySelector('p:nth-child(2)').textContent;
            const title = row.querySelector('p:nth-child(3)').textContent;
            const description = row.querySelector('p:nth-child(4)').textContent;
            const hasCheck = row.querySelector('.fa-xmark') !== null;

            // Determine category based on parent section
            let category = '';
            const isNote = row.closest('.poznámky') !== null;
            if (isNote) {
                category = 'Poznámka';
            } else if (row.closest('.ukoly')) {
                category = 'Úkol';
            } else if (row.closest('.testy')) {
                category = 'Test';
            }

            // Populate detail popup
            detailTitle.textContent = `${category} - ${title}`;
            detailDate.textContent = date;
            detailSubject.textContent = subject;
            
            if (isNote) {
                detailStatus.innerHTML = '';
                detailStatus.parentElement?.classList.add('hidden');
            } else {
                detailStatus.innerHTML = hasCheck ? 
                    '<i class="fa-solid fa-xmark text-primary"></i> Nedokončeno' : 
                    '<i class="fa-solid fa-clock text-yellow-500"></i> Čeká na splnění';
                detailStatus.parentElement?.classList.remove('hidden');
            }
            
            detailDescription.textContent = description;
            detailPopup.classList.remove('hidden');
        });
    }

    // Add click handlers to existing rows
    document.querySelectorAll('.poznámky .group, .ukoly .group, .testy .group').forEach(row => {
        addRowClickHandler(row);
    });

    // Close detail popup
    closeDetailPopup?.addEventListener('click', () => {
        detailPopup?.classList.add('hidden');
    });

    // Close popup when clicking outside
    detailPopup?.addEventListener('click', (e) => {
        if (e.target === detailPopup) {
            detailPopup.classList.add('hidden');
        }
    });
});
