document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.getElementById('plusButton');
    const plusMenu = document.getElementById('plusMenu');

    
    plusButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        plusMenu.classList.toggle('hidden');
    });

    
    document.addEventListener('click', () => {
        plusMenu.classList.add('hidden');
    });

    
    plusMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});