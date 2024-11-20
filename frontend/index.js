document.addEventListener('DOMContentLoaded', async () => {
    let previousData = new Map(); // Store previous data for comparison

    try {
        const response = await fetch("http://localhost:3001/data");
        const data = await response.json();
        let filteredData = [...data];
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

        // Function to calculate questions added
        const calculateQuestionsAdded = (student) => {
            const previous = previousData.get(student.roll);
            if (!previous) {
                previousData.set(student.roll, student.totalSolved || 0);
                return 0;
            }
            const added = (student.totalSolved || 0) - previous;
            previousData.set(student.roll, student.totalSolved || 0);
            return added;
        };

        const exportToCSV = (data) => {
            const headers = ['Rank', 'Roll Number', 'Name', 'Section', 'Total Solved', 'Questions Added', 'Easy', 'Medium', 'Hard', 'LeetCode URL'];
            const csvRows = data.map((student, index) => {
                return [
                    index + 1,
                    student.roll,
                    student.name,
                    student.section || 'N/A',
                    student.totalSolved || 'N/A',
                    calculateQuestionsAdded(student),
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

        const renderLeaderboard = (sortedData) => {
            leaderboardBody.innerHTML = '';
            sortedData.forEach((student, index) => {
                const questionsAdded = calculateQuestionsAdded(student);
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
                    <td class="p-4 text-blue-400">
                        ${questionsAdded > 0 ? `+${questionsAdded}` : questionsAdded}
                    </td>
                    <td class="p-4 text-green-400">${student.easySolved || 'N/A'}</td>
                    <td class="p-4 text-yellow-400">${student.mediumSolved || 'N/A'}</td>
                    <td class="p-4 text-red-400">${student.hardSolved || 'N/A'}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        };

        const filterData = (section) => {
            filteredData = section === 'all' 
                ? [...data]
                : data.filter(student => (student.section || 'N/A') === section);
            renderLeaderboard(filteredData);
        };

        let totalSolvedDirection = 'desc';
        let easySolvedDirection = 'desc';
        let mediumSolvedDirection = 'desc';
        let hardSolvedDirection = 'desc';
        let sectionDirection = 'asc';
        let addedDirection = 'desc';

        const sortData = (data, field, direction, isNumeric = false) => {
            return data.sort((a, b) => {
                let valA, valB;
                if (field === 'questionsAdded') {
                    valA = calculateQuestionsAdded(a);
                    valB = calculateQuestionsAdded(b);
                } else {
                    valA = a[field] || (isNumeric ? 0 : 'Z');
                    valB = b[field] || (isNumeric ? 0 : 'Z');
                }
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
            exportToCSV(filteredData);
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

        document.getElementById('sort-added').addEventListener('click', () => {
            addedDirection = addedDirection === 'desc' ? 'asc' : 'desc';
            const sortedData = sortData(filteredData, 'questionsAdded', addedDirection, true);
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
        setInterval(async () => {
            try {
                const response = await fetch("http://localhost:3001/data");
                const newData = await response.json();
                data.length = 0;
                data.push(...newData);
                filterData(sectionFilter.value);
            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }, 300000); // Refresh every 5 minutes

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('error-state').classList.remove('hidden');
    }
});