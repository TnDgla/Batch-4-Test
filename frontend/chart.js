
const generateChart = (data, residenceData) => {
  try {
    let dayScholarSolved = 0;
    let hostellerSolved = 0;

    if (residenceData.length > 0) {
      data = data.map((student, idx) => {
        return {
          ...student, residence: residenceData[idx]
        }
      })

      const dayScholars = data.filter((item) => item.totalSolved && !item.info && item.residence === "Day Scholars");
      const hostellers = data.filter((item) => item.totalSolved && !item.info && item.residence === "Hostellers");

      dayScholarSolved = dayScholars.reduce((acc, item) => acc + item.totalSolved, 0);
      hostellerSolved = hostellers.reduce((acc, item) => acc + item.totalSolved, 0);

      const ctx = document.getElementById('sectionPieChart').getContext('2d');

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Day Scholars', 'Hostellers'],
          datasets: [{
            label: 'Total Solved',
            data: [dayScholarSolved, hostellerSolved],
            backgroundColor: [
              'orange',
              'teal'
            ],
            borderColor: [
              'teal',
              'orange'
            ],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Total Solved by Day Scholars and Hostellers'
            }
          }
        }
      });


    }

  } catch (error) {
    console.error("Error generating chart:", error);
  }
};



document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch("http://localhost:3001/data");
    const data = await response.json();

    const getResidence = await fetch("http://localhost:3001/get-residence");
    const residenceData = await getResidence.json();

    generateChart(data, residenceData);

  } catch (error) {
    console.error("Error fetching data:", error);
  }

});