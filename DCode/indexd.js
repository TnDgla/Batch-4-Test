document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch("http://localhost:3001/data");
        const data = await response.json();
        let filteredData = [...data]; // Keep original data separate
        const leaderboardBody = document.getElementById('leaderboard-body');
        const sectionFilter = document.getElementById('section-filter');

        // Populate section filter dropdown
        const populateSectionFilter = () => {
            const sections = [...new Set(data.map(student => student.section || 'N/A'))].sort();
            sectionFilter.innerHTML = '<option value="all">All Sections</option>';
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                sectionFilter.appendChild(option);
            });
        };
        //Search bar
        // Function to filter student data based on search input
        const search_input = document.querySelector(".search_input");
        const search_form = document.querySelector(".search_form");
        search_form.addEventListener("submit", (e) => {
            e.preventDefault();
            const searchText = search_input.value.toLowerCase();
            const filteredData = data.filter(student => {
                const name = student.name.toLowerCase();
                const roll = student.roll.toLowerCase();
                return name.includes(searchText) || roll.includes(searchText);
            });
            renderLeaderboard(filteredData);
        })

        // Represent total number of students section wise in pie chart
        const ctx = document.getElementById('myChart');
        const DSection = data.filter(student => {
            const section = student.section.toLowerCase();
            return section.includes('d');
        })
        const ESection = data.filter(student => {
            const section = student.section.toLowerCase();
            return section.includes('e');
        })
        const CSection = data.filter(student => {
            const section = student.section.toLowerCase();
            return section.includes('c');
        })
        const ACSection = data.filter(student => {
            const section = student.section.toLowerCase();
            return section.includes('ac');
        })
        const AHSection = data.filter(student => {
            const section = student.section.toLowerCase();
            return section.includes('a(h)');
        })
        // console.log(DSection.length, CSection.length, ESection.length, ACSection.length, AHSection.length);
        const pieData = {
            labels: [
                'D',
                'E',
                'C',
                'AC',
                'A(H)'
            ],
            datasets: [{
                label: '',
                data: [DSection.length, ESection.length, CSection.length,ACSection.length, AHSection.length],
                backgroundColor: [
                    'blue',
                    'green',
                    'yellow',
                    'red',
                    'lime'
                ],
                hoverOffset: 4
            }]
        };
        new Chart(ctx, {
            type: 'pie',
            data: pieData
        });

        // Function to export data to CSV
        const exportToCSV = (data) => {
            const headers = ['Rank', 'Roll Number', 'Name', 'Section', 'Total Solved', 'Easy', 'Medium', 'Hard', 'LeetCode URL'];
            const csvRows = data.map((student, index) => {
                return [
                    index + 1,
                    student.roll,
                    student.name,
                    student.section || 'N/A',
                    student.totalSolved || 'N/A',
                    student.easySolved || 'N/A',
                    student.mediumSolved || 'N/A',
                    student.hardSolved || 'N/A',
                    student.url
                ].join(',');
            });
            
            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'leaderboard.csv');
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Function to render the leaderboard
        const renderLeaderboard = (sortedData) => {
            leaderboardBody.innerHTML = '';
            sortedData.forEach((student, index) => {
                const row = document.createElement('tr');
                row.classList.add('border-b', 'border-gray-700');
                row.innerHTML = `
                    <td class="p-4">${index + 1}</td>
                    <td class="p-4">${student.roll}</td>
                    <td class="p-4">
                        ${student.url.startsWith('https://leetcode.com/u/') 
                            ? `<a href="${student.url}" target="_blank" class="text-blue-400">${student.name}</a>`
                            : `<div class="text-red-500">${student.name}</div>`}
                    </td>
                    <td class="p-4">${student.section || 'N/A'}</td>
                    <td class="p-4">${student.totalSolved || 'N/A'}</td>
                    <td class="p-4 text-green-400">${student.easySolved || 'N/A'}</td>
                    <td class="p-4 text-yellow-400">${student.mediumSolved || 'N/A'}</td>
                    <td class="p-4 text-red-400">${student.hardSolved || 'N/A'}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        };

        // Filter function
        const filterData = (section) => {
            filteredData = section === 'all' 
                ? [...data]
                : data.filter(student => (student.section || 'N/A') === section);
            renderLeaderboard(filteredData);
        };

        // Sorting logic with ascending and descending functionality
        let totalSolvedDirection = 'desc';
        let easySolvedDirection = 'desc';
        let mediumSolvedDirection = 'desc';
        let hardSolvedDirection = 'desc';
        let sectionDirection = 'asc';

        const sortData = (data, field, direction, isNumeric = false) => {
            return data.sort((a, b) => {
                const valA = a[field] || (isNumeric ? 0 : 'Z');
                const valB = b[field] || (isNumeric ? 0 : 'Z');
                if (isNumeric) {
                    return direction === 'desc' ? valB - valA : valA - valB;
                } else {
                    return direction === 'desc'
                        ? valB.toString().localeCompare(valA.toString())
                        : valA.toString().localeCompare(valB.toString());
                }
            });
        };

        // Initialize the page
        populateSectionFilter();
        renderLeaderboard(data);

        // Event Listeners
        sectionFilter.addEventListener('change', (e) => {
            filterData(e.target.value);
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            exportToCSV(filteredData); // Export only filtered data
        });

        document.getElementById('sort-section').addEventListener('click', () => {
            sectionDirection = sectionDirection === 'desc' ? 'asc' : 'desc';
            const sortedData = sortData(filteredData, 'section', sectionDirection, false);
            renderLeaderboard(sortedData);
        });

        document.getElementById('sort-total').addEventListener('click', () => {
            totalSolvedDirection = totalSolvedDirection === 'desc' ? 'asc' : 'desc';
            const sortedData = sortData(filteredData, 'totalSolved', totalSolvedDirection, true);
            renderLeaderboard(sortedData);
        });

        document.getElementById('sort-easy').addEventListener('click', () => {
            easySolvedDirection = easySolvedDirection === 'desc' ? 'asc' : 'desc';
            const sortedData = sortData(filteredData, 'easySolved', easySolvedDirection, true);
            renderLeaderboard(sortedData);
        });

        document.getElementById('sort-medium').addEventListener('click', () => {
            mediumSolvedDirection = mediumSolvedDirection === 'desc' ? 'asc' : 'desc';
            const sortedData = sortData(filteredData, 'mediumSolved', mediumSolvedDirection, true);
            renderLeaderboard(sortedData);
        });

        document.getElementById('sort-hard').addEventListener('click', () => {
            hardSolvedDirection = hardSolvedDirection === 'desc' ? 'asc' : 'desc';
            const sortedData = sortData(filteredData, 'hardSolved', hardSolvedDirection, true);
            renderLeaderboard(sortedData);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});




// row.addEventListener("click", () => {
//     row.style.position='fixed';
//     row.style.border='solid 5px';
//     row.style.color='red';
// });







// document.getElementById('submission').addEventListener('click', () => {
//     const user1 = filteredData.find(user => user.name === "user1");
//     const user2 = filteredData.find(user => user.name === "user2");
//
//     if (user1 && user2) {
//         console.log(`${user1.totalSolved} > ${user2.totalSolved}`);
//     } else {
//         console.log("One or both users not found.");
//     }
// });



// git add .
//     git commit -m 'test done'
// git push origin
//
// 1. go to the repo and create pull request
// 2. add title and description (sc of your work)
// 3. create PR