document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:3001/data");
    const data = await response.json();
    let filteredData = [...data];

    const leaderboardBody = document.getElementById("leaderboard-body");
    const sectionFilter = document.getElementById("section-filter");

    const populateSectionFilter = () => {
      const sections = [
        ...new Set(data.map((student) => student.section || "N/A")),
      ].sort();
      sectionFilter.innerHTML = '<option value="all">All Sections</option>';
      sections.forEach((section) => {
        const option = document.createElement("option");
        option.value = section;
        option.textContent = section;
        sectionFilter.appendChild(option);
      });
    };

    const renderLeaderboard = (students) => {
      leaderboardBody.innerHTML = "";
      students.forEach((student, index) => {
        const row = document.createElement("tr");
        row.classList.add("border-b", "border-gray-700");
        row.innerHTML = `
          <td class="p-4">${index + 1}</td>
          <td class="p-4">${student.roll}</td>
          <td class="p-4">${student.name}</td>
          <td class="p-4">${student.section || "N/A"}</td>
          <td class="p-4">${student.totalSolved || "N/A"}</td>
        `;
        leaderboardBody.appendChild(row);
      });
    };

    const filterData = (section) => {
      filteredData =
        section === "all"
          ? [...data]
          : data.filter((student) => (student.section || "N/A") === section);
      renderLeaderboard(filteredData);
    };

    window.searchLeaderboard = () => {
      const query = document.getElementById("search-bar").value.toLowerCase();
      const filteredSearchData = filteredData.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.roll.toString().includes(query)
      );
      renderLeaderboard(filteredSearchData);
    };

    const renderPieChart = (students) => {
      const sections = {};
      students.forEach((student) => {
        const section = student.section || "N/A";
        sections[section] = (sections[section] || 0) + 1;
      });

      const ctx = document.getElementById("section-pie-chart").getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(sections),
          datasets: [
            {
              data: Object.values(sections),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4CAF50",
                "#FFC107",
                "#008080",
                "#800080",
                "#FFA500",
                "#87CEEB",
                "#FFC0CB",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    };

    populateSectionFilter();
    renderLeaderboard(data);
    renderPieChart(data);

    sectionFilter.addEventListener("change", (e) => {
      filterData(e.target.value);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
