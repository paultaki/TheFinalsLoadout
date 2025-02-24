async function fetchLeaderboard() {
  try {
    let response = await fetch(
      "https://api.the-finals-leaderboard.com/v1/leaderboard/s5/crossplay"
    );
    let data = await response.json();

    let tableBody = document.querySelector("#leaderboard tbody");
    tableBody.innerHTML = ""; // Clear previous data

    data.slice(0, 20).forEach((player) => {
      let row = document.createElement("tr");
      row.innerHTML = `
                <td>${player.r}</td>
                <td>${player.name}</td>
                <td>${player.f.toLocaleString()}</td>
                <td>${player.c}</td>
            `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
}

// Fetch leaderboard on page load and refresh every 5 minutes
fetchLeaderboard();
setInterval(fetchLeaderboard, 300000); // Refresh every 5 minutes
