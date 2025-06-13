document.addEventListener("DOMContentLoaded", () => {
  const rewardButton = document.getElementById("rewardButton");
  const pointsInput = document.getElementById("pointsInput");
  const currentPointsSpan = document.getElementById("currentPoints");

  const API_URLS = {
    REDEEM: "/apps/generic-name/reward-point-system/redeem",
    HISTORY: "/apps/generic-name/reward-point-system/get-history",
  };

  const apiCall = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }
    return data;
  };

  const updateCustomerData = (apiResponse) => {
    const currentPoints = apiResponse.remainingPoints || 0;
    currentPointsSpan.textContent = currentPoints;
    console.log("History data:", apiResponse.data);
  };

  const validatePointsInput = (pointsToRedeem) => {
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      throw new Error("Please enter a valid number of points.");
    }
    if (!Number.isInteger(Number(pointsToRedeem))) {
      throw new Error("Points must be a whole number.");
    }

    return Number(pointsToRedeem);
  };

  const handleRedeem = async () => {
    try {
      const pointsToRedeem = validatePointsInput(pointsInput.value);

      rewardButton.disabled = true;
      rewardButton.textContent = "Redeeming...";

      await apiCall(API_URLS.REDEEM, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: pointsToRedeem }),
      });

      alert("Points redeemed successfully!");

      const latestData = await apiCall(API_URLS.HISTORY);
      updateCustomerData(latestData);

      pointsInput.value = "";
    } catch (error) {
      console.error("Redemption failed:", error);
      alert(error.message);
    } finally {
      rewardButton.disabled = false;
      rewardButton.textContent = "Submit";
    }
  };

  rewardButton?.addEventListener("click", handleRedeem);

  pointsInput?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleRedeem();
    }
  });

  apiCall(API_URLS.HISTORY)
    .then(updateCustomerData)
    .catch((error) => {
      console.error("Failed to load initial points:", error);
      currentPointsSpan.textContent = "Error";
    });
});
