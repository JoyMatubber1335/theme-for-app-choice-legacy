document.addEventListener("DOMContentLoaded", () => {
  const rewardButton = document.getElementById("rewardButton");
  if (rewardButton) {
    rewardButton.addEventListener("click", async () => {
      const API_BASE_URL = "/apps/generic-name/reward-point-system/redeem";
      const data = {
        points: 400,
      };

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log("Response:", response);
    });
  }
});
