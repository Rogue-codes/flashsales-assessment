import cron from "node-cron";
import salesEventModel from "../models/salesEventModel";

// Function to activate sales events
const activateSalesEvents = async () => {
  try {
    const now = new Date(); // Get current date & time in UTC

    // Fetch events where isActive is false and start time has been reached
    const eventsToActivate = await salesEventModel.find({
      isActive: false, // Only check inactive events
      startDate: { $lte: now.toISOString().split("T")[0] }, // Ensure startDate has arrived
      startTime: { $lte: now.toISOString().split("T")[1].split(".")[0] }, // Ensure startTime has arrived
    });

    if (eventsToActivate.length > 0) {
      await salesEventModel.updateMany(
        { _id: { $in: eventsToActivate.map((event) => event._id) } },
        { $set: { isActive: true } }
      );
      console.log(`✅ Activated ${eventsToActivate.length} sales events`);
    }
  } catch (error) {
    console.error("❌ Error activating sales events:", error);
  }
};

// Run the cron job every minute to check for new events
cron.schedule("* * * * *", () => {
  console.log("⏳ Checking for sales events to activate...");
  activateSalesEvents();
});

export default activateSalesEvents;
