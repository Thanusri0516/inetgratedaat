import { Temperature } from '../models/Temperature.js'

function describeBand(celsius) {
  if (celsius >= 32) return 'hot'
  if (celsius <= 20) return 'cold'
  return 'normal'
}

function formatCelsius(value) {
  return `${Number(value).toFixed(1)} C`
}

function describeComfort(latest) {
  const humidity = latest.humidityPercent ?? 0

  if (latest.celsius >= 22 && latest.celsius <= 29 && humidity >= 35 && humidity <= 65) {
    return {
      label: 'comfortable',
      room: `The room feels comfortable right now. It is ${formatCelsius(latest.celsius)} with ${humidity}% humidity.`,
      stay: 'Yes, it is okay to stay in this room.',
    }
  }

  if (latest.celsius > 29 || humidity > 70) {
    return {
      label: 'warm',
      room: `The room feels a bit warm right now. It is ${formatCelsius(latest.celsius)} with ${humidity}% humidity.`,
      stay: 'You can stay in the room, but it may feel a little warm or stuffy.',
    }
  }

  return {
    label: 'cool',
    room: `The room feels slightly cool right now. It is ${formatCelsius(latest.celsius)} with ${humidity}% humidity.`,
    stay: 'Yes, it is okay to stay in the room, though it may feel a little cool.',
  }
}

function fallbackReply(latest) {
  return `I can answer simple temperature questions. Right now it is ${formatCelsius(latest.celsius)} and feels ${describeBand(latest.celsius)}.`
}

function hasSensorData(latest) {
  return latest.source !== 'No Data' && latest.source !== 'Backend Error'
}

export async function getChatbotReply(message) {
  const [latest, prediction] = await Promise.all([
    Temperature.getLatest(),
    Temperature.getPrediction(),
  ])

  const text = String(message ?? '').trim().toLowerCase()

  if (!text) {
    return {
      reply: 'Ask a simple question like "What is the temperature?" or "Is it hot?"',
    }
  }

  if (!hasSensorData(latest)) {
    return {
      reply:
        'I do not have a live sensor reading yet. Start the backend, connect the Arduino, and ask again in a few seconds.',
    }
  }

  if (
    text.includes('temperature now') ||
    text.includes('current temperature') ||
    text.includes('what is the temperature')
  ) {
    return { reply: `The latest temperature is ${formatCelsius(latest.celsius)}.` }
  }

  if (text.includes('is it hot') || text.includes('hot or cold') || text.includes('is it cold')) {
    const band = describeBand(latest.celsius)
    return {
      reply:
        band === 'hot'
          ? `Yes, it is hot right now at ${formatCelsius(latest.celsius)}.`
          : band === 'cold'
            ? `It is cold right now at ${formatCelsius(latest.celsius)}.`
            : `It is not too hot or too cold right now. The temperature is ${formatCelsius(latest.celsius)}.`,
    }
  }

  if (text.includes('humidity')) {
    return { reply: `The latest humidity is ${latest.humidityPercent ?? 0}%.` }
  }

  if (text.includes('high') || text.includes('maximum')) {
    return { reply: `Today's high temperature is ${formatCelsius(latest.highCelsius ?? latest.celsius)}.` }
  }

  if (text.includes('low') || text.includes('minimum')) {
    return { reply: `Today's low temperature is ${formatCelsius(latest.lowCelsius ?? latest.celsius)}.` }
  }

  if (text.includes('forecast') || text.includes('predict') || text.includes('next hour')) {
    return { reply: `The forecast for the next hour is ${formatCelsius(prediction.celsius)}.` }
  }

  if (text.includes('comfortable') || text.includes('comfort')) {
    const comfort = describeComfort(latest)
    return {
      reply: `The temperature is ${comfort.label}. It is currently ${formatCelsius(latest.celsius)} with ${latest.humidityPercent ?? 0}% humidity.`,
    }
  }

  if (text.includes('room condition') || text.includes('how is the room')) {
    return { reply: describeComfort(latest).room }
  }

  if (
    text.includes('okay to stay') ||
    text.includes('safe to stay') ||
    text.includes('stay in this room')
  ) {
    return { reply: describeComfort(latest).stay }
  }

  if (text.includes('summary') || text.includes('status')) {
    const comfort = describeComfort(latest)
    return {
      reply: `Current temperature is ${formatCelsius(latest.celsius)}, humidity is ${latest.humidityPercent ?? 0}%, and the room feels ${comfort.label}.`,
    }
  }

  return { reply: fallbackReply(latest) }
}
