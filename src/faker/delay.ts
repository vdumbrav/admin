export const delay = (min = 200, max = 500) => new Promise(r => setTimeout(r, Math.random() * (max - min) + min))
