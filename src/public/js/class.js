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



const ctx = document.getElementById('gaugeChart').getContext('2d');

const gaugeChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Hotovo', 'Zbývá'], //vrchní labels
    datasets: [{
      data: [90, 10], // [procento uspesnosti, zbytek]
      backgroundColor: ['#3b82f6', '#e5e7eb'], // blue and light gray
      borderWidth: 0
    }]
  },
  options: {
    cutout: '70%', //sirka cary (mensi procento -> sirsi)
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
  const text = '70%';
  ctx.font = 'bold 3rem sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, width / 2, height / 1.2);
  ctx.restore();
}
}]

});


