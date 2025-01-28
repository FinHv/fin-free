const { exec } = require('child_process');
const { formatText, colors } = require('./utils');


// Parse `df` output into structured data
const parseDfOutput = (output, disksConfig) => {
  const lines = output.trim().split('\n').slice(1); // Skip the header
  const results = [];

  Object.entries(disksConfig).forEach(([sectionName, sectionConfig]) => {
    const devices = sectionConfig.devices;

    if (!devices || devices.length === 0) {
      console.warn(`[WARN] No devices found for section: ${sectionName}`);
      return;
    }

    let total = 0;
    let used = 0;
    let free = 0;

    devices.forEach((device) => {
      const deviceLine = lines.find((line) => line.startsWith(device));
      if (deviceLine) {
        const [, blocks, usedSpace, availSpace] = deviceLine.trim().split(/\s+/);

        total += parseFloat(blocks);       // Total space in MB
        used += parseFloat(usedSpace);    // Used space in MB
        free += parseFloat(availSpace);   // Free space in MB
      } else {
        console.warn(`[WARN] Device not found in df output: ${device}`);
      }
    });

    // Push result for this section
    if (total > 0) {
      results.push({
        section: sectionConfig.ircName,
        total: (total / 1024 / 1024).toFixed(2), // Convert to TB
        used: (used / 1024 / 1024).toFixed(2),
        free: (free / 1024 / 1024).toFixed(2),
      });
    }
  });

  return results;
};

const getDiskUsage = async (disksConfig) => {
  if (!disksConfig || typeof disksConfig !== 'object') {
    throw new Error('[ERROR] Invalid disks configuration.');
  }

  return new Promise((resolve, reject) => {
    exec('df -Pm', (err, stdout, stderr) => {
      if (err) {
        console.error(`[ERROR] Failed to execute df command: ${stderr || err.message}`);
        reject(err);
        return;
      }

      try {
        //console.debug(`[DEBUG] df command output:\n${stdout}`);
        const results = parseDfOutput(stdout, disksConfig);
        resolve(results);
      } catch (parseErr) {
        console.error(`[ERROR] Failed to parse df output: ${parseErr.message}`);
        reject(parseErr);
      }
    });
  });
};

const formatDiskUsage = (diskData) => {
  return diskData.map(({ section, total, used, free }) => {
    return formatText(
      `${section}: `, colors.bold, colors.red
    ) +
      formatText(
        `${free} TB`, colors.green, colors.bold
      ) +
      formatText(` of `, colors.gray) +
      formatText(
        `${total} TB`, colors.purple, colors.bold
      ) +
      formatText(` free - Used `, colors.gray) +
      formatText(`${used} TB`, colors.red, colors.bold);
  });
};


module.exports = { getDiskUsage,formatDiskUsage };
