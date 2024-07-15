import deepFreeze from 'deep-freeze'


class DeepFrozenSt {
  constructor () {
    this.state = {}
    this.callbacks = []
  }

  getState = () => this.state;

  setState (patch) {
    const nextState = deepFreeze({ ...this.state, ...patch });

    this._publish(this.state, nextState, patch)
    this.state = nextState
  }

  subscribe (listener) {
    this.callbacks.push(listener)
    return () => {
      // Remove the listener.
      this.callbacks.splice(
        this.callbacks.indexOf(listener),
        1,
      )
    }
  }

  //#TODO not forget to test
  _publish (...args) {
    this.callbacks.forEach((listener) => {
      listener(...args)
    })
  }
}

export default function defaultStore () {
  return new DeepFrozenSt()
}
