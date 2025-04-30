document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle logic
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

    // Gauge chart logic
    const ctx = document.getElementById('gaugeChart').getContext('2d');
    const completion = 92;

    const gaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hotovo', 'Zbývá'],
            datasets: [{
                data: [completion, 100 - completion],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
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
                const text = `${completion}%`; // ← now shows "80%"
                ctx.font = 'bold 3rem sans-serif';
                ctx.textBaseline = 'middle';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(text, width / 2, height / 1.2);
                ctx.restore();
            }
        }]
    });
});
