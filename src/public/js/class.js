document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle logic
    const plusButton = document.getElementById('plusButton');
    const plusMenu = document.getElementById('plusMenu');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');
    const notesButton = plusMenu?.querySelector('button:nth-child(1)'); 
    const homeworkButton = plusMenu?.querySelector('button:nth-child(2)'); 
    const testButton = plusMenu?.querySelector('button:nth-child(3)'); 
    const eventButton = plusMenu?.querySelector('button:nth-child(4)'); 
    const popupTitle = document.getElementById('popupTitle');

    // Plus button click handler
    plusButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        plusMenu?.classList.toggle('hidden');
    });

    // Document click handler to close plus menu
    document.addEventListener('click', () => {
        plusMenu?.classList.add('hidden');
    });

    // Prevent menu close when clicking inside
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





    // ...existing code...

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
});
