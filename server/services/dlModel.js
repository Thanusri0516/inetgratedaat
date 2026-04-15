const { spawn } = require("child_process");

function getPrediction(data) {
  return new Promise((resolve, reject) => {

    const py = spawn("python", [
      "../ml-model/predict_lstm.py",
      JSON.stringify(data)
    ]);

    let result = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    // Ignore warnings, just log them
    py.stderr.on("data", (err) => {
      console.warn("Python warning:", err.toString());
    });

    // Handle process errors
    py.on("error", (err) => {
      reject("Failed to start Python process: " + err.message);
    });

    py.on("close", (code) => {
      const cleaned = result.trim();

      const num = parseFloat(cleaned);

      if (isNaN(num)) {
        return reject("Invalid ML output: " + cleaned);
      }

      resolve(num);
    });

  });
}

module.exports = { getPrediction };