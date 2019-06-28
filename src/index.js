import { memoizeWith, modulo } from 'ramda'
import EventEmitter from 'eventemitter3'

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

class Param extends EventEmitter {
  constructor (value) {
    super()
    this._ = {
      value
    }
  }
  get value () {
    return this._.value
  }
  set value (newValue) {
    this._.value = newValue
    this.emit('change', newValue)
  }
}

class Wave {
  constructor(ctx) {
    const phase = new Param(0)
    const offset = new Param(0)
    const frequency = new Param(440)

    phase.on('change', () => {
      // phase changed, regenerate this._.waveform and set it for this._.oscillator
    })
    offset.on('change', () => {
      // offset changed, adjust this._.offset
    })

    const waveform = createWave(phase.value, ctx)
    
    const oscillator = ctx.createOscillator()
    oscillator.frequency.value = frequency.value
    oscillator.setPeriodicWave(waveform)

    const offset = ctx.createConstantSource()
    offset.offset.value = offset.value

    this.phase = phase
    this.offset = offset
    this.frequency = frequency

    this._ = {
      ctx,
      waveform,
      oscillator,
      offset
    }
  }

  start(when) {
    const { oscillator, offset } = this._

    oscillator.start(when)
    offset.start(when)
  }

  stop(when) {
    const { oscillator, offset } = this._

    oscillator.stop(when)
    offset.stop(when)
  }

  connect(target) {
    const { oscillator, offset } = this._

    oscillator.connect(target)
    offset.connect(target)
  }
}

export default Wave
