document.addEventListener("DOMContentLoaded", () => {
  const rewardButton = document.getElementById("rewardButton");

  if (rewardButton) {
    rewardButton.addEventListener("click", async () => {
      const API_BASE_URL = "/apps/generic-name/reward-point-system/redeem";

      // Optional: If you need to send data with the request, define it here.
      const data = {
        points: 400, // Example data; adjust as needed
      };

      const response = await fetch(API_BASE_URL, {
        method: "POST", // Or 'GET', 'PUT', etc., depending on your API
        headers: {
          "Content-Type": "application/json",
          // Add any other headers your API requires, like authorization tokens
        },
        body: JSON.stringify(data), // Only include this if your API expects a request body
      });
      console.log("Response:", response);
    });
  }
});
