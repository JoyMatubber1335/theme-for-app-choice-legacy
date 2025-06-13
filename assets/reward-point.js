document.addEventListener("DOMContentLoaded", () => {
  const rewardButton = document.getElementById("rewardButton");
  const pointsInput = document.getElementById("pointsInput");

  const API_URLS = {
    REDEEM: "/apps/generic-name/reward-point-system/redeem",
    HISTORY: "/apps/generic-name/reward-point-system/get-history",
  };

  /**
   * A single, reusable function to handle all API calls.
   * It fetches data, handles JSON parsing, and standardizes error handling.
   */
  const apiCall = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json(); // Parse JSON to get success or error messages
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  };

  /**
   * Renders the history list using a concise map and join.
   */
  const renderHistory = (historyData) => {
    console.log("Rendering history:", historyData);
  };

  /**
   * Validates the points input
   */
  const validatePointsInput = (points) => {
    if (!points || points <= 0) {
      throw new Error("Please enter a valid number of points greater than 0");
    }
    if (!Number.isInteger(Number(points))) {
      throw new Error("Points must be a whole number");
    }
    return Number(points);
  };

  /**
   * The main function to handle the redemption process.
   */
  const handleRedeem = async () => {
    try {
      // Get and validate points input
      const pointsToRedeem = validatePointsInput(pointsInput.value);

      rewardButton.disabled = true;
      rewardButton.textContent = "Redeeming...";

      // 1. Redeem points
      const redeemResult = await apiCall(API_URLS.REDEEM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ point: pointsToRedeem }),
      });

      // 2. Refresh history
      const historyResult = await apiCall(API_URLS.HISTORY);
      renderHistory(historyResult);

      // Clear input after successful redemption
      pointsInput.value = "";
    } catch (error) {
      console.error("Redemption failed:", error);
      alert(error.message); // Show user-friendly error message
    } finally {
      rewardButton.disabled = false;
      rewardButton.textContent = "Redeem Points";
    }
  };

  rewardButton?.addEventListener("click", handleRedeem);

  // Allow Enter key to trigger redemption
  pointsInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleRedeem();
    }
  });

  // Load initial history
  apiCall(API_URLS.HISTORY).then(renderHistory).catch(console.error);
});
