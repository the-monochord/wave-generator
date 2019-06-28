import { memoizeWith, modulo } from 'ramda'
const roundToNDecimals = curry((decimals, number) => Math.round(number * 10 ** decimals) / 10 ** decimals)

const createWave = memoizeWith(
  phaseOffset => roundToNDecimals(2, modulo(phaseOffset, 1)),
  (phaseOffset, ctx) => {
    const real = new Float32Array(2)
    const imag = new Float32Array(2)
    const shift = 2 * Math.PI * roundToNDecimals(2, modulo(phaseOffset, 1))

    real[0] = 1
    real[1] = 0 * Math.cos(shift) - 1 * Math.sin(shift)
    imag[0] = 0
    imag[1] = 0 * Math.sin(shift) + 1 * Math.cos(shift)

    return ctx.createPeriodicWave(real, imag, { disableNormalization: true })
  }
)

const ctx = new OfflineAudioContext(1, 44100 * 2, 44100)

const OFFSET = 0.7
const PHASE = 0.35

const wave = createWave(PHASE, ctx)

const oscillator = ctx.createOscillator()
oscillator.frequency.value = 400
oscillator.setPeriodicWave(wave)

const offset = ctx.createConstantSource()
offset.offset.value = OFFSET

oscillator.connect(ctx.destination)
offset.connect(ctx.destination)

// ---------- start

oscillator.start()
offset.start()
