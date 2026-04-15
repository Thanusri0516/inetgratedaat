import { Temperature } from '../models/Temperature.js'

function describeBand(celsius) {
  if (celsius >= 32) return 'hot'
  if (celsius <= 20) return 'cold'
  return 'normal'
}

function describeComfort(latest) {
  const humidity = latest.humidityPercent ?? 0

  if (latest.celsius >= 22 && latest.celsius <= 29 && humidity >= 35 && humidity <= 65) {
    return {
      label: 'comfortable',
      room: `The room feels comfortable right now. It is ${latest.celsius} C with ${humidity}% humidity.`,
      stay: 'Yes, it is okay to stay in this room.',
    }
  }

  if (latest.celsius > 29 || humidity > 70) {
    return {
      label: 'warm',
      room: `The room feels a bit warm right now. It is ${latest.celsius} C with ${humidity}% humidity.`,
      stay: 'You can stay in the room, but it may feel a little warm or stuffy.',
    }
  }

  return {
    label: 'cool',
    room: `The room feels slightly cool right now. It is ${latest.celsius} C with ${humidity}% humidity.`,
    stay: 'Yes, it is okay to stay in the room, though it may feel a little cool.',
  }
}

function fallbackReply(latest) {
  return `I can answer simple temperature questions. Right now it is ${latest.celsius} C and feels ${describeBand(latest.celsius)}.`
}

export function getChatbotReply(message) {
  const latest = Temperature.getLatest()
  const prediction = Temperature.getPrediction()
  const text = String(message ?? '').trim().toLowerCase()

  if (!text) {
    return {
      reply: 'Ask a simple question like "What is the temperature?" or "Is it hot?"',
    }
  }

  if (
    text.includes('temperature now') ||
    text.includes('current temperature') ||
    text.includes('what is the temperature')
  ) {
    return { reply: `The latest temperature is ${latest.celsius} C.` }
  }

  if (text.includes('is it hot') || text.includes('hot or cold') || text.includes('is it cold')) {
    const band = describeBand(latest.celsius)
    return {
      reply:
        band === 'hot'
          ? `Yes, it is hot right now at ${latest.celsius} C.`
          : band === 'cold'
            ? `It is cold right now at ${latest.celsius} C.`
            : `It is not too hot or too cold right now. The temperature is ${latest.celsius} C.`,
    }
  }

  if (text.includes('humidity')) {
    return { reply: `The latest humidity is ${latest.humidityPercent}%.` }
  }

  if (text.includes('high') || text.includes('maximum')) {
    return { reply: `Today's high temperature is ${latest.highCelsius} C.` }
  }

  if (text.includes('low') || text.includes('minimum')) {
    return { reply: `Today's low temperature is ${latest.lowCelsius} C.` }
  }

  if (text.includes('forecast') || text.includes('predict') || text.includes('next hour')) {
    return { reply: `The forecast for the next hour is ${prediction.celsius} C.` }
  }

  if (text.includes('comfortable') || text.includes('comfort')) {
    const comfort = describeComfort(latest)
    return {
      reply: `The temperature is ${comfort.label}. It is currently ${latest.celsius} C with ${latest.humidityPercent}% humidity.`,
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
      reply: `Current temperature is ${latest.celsius} C, humidity is ${latest.humidityPercent}%, and the room feels ${comfort.label}.`,
    }
  }

  return { reply: fallbackReply(latest) }
}
