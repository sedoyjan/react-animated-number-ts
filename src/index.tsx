import React, { Component, CSSProperties } from 'react'
import raf from 'raf'

const ANIMATION_DURATION: number = 300

export interface AnimatedNumberProps {
    component: string,
    value: number,
    initialValue: number,
    duration: number,
    stepPrecision: number,
    style?: CSSProperties,
    className?: string,

    formatValue?: (n: number) => string | number,
    frameStyle?: (perc: number) => Object,
}

export interface AnimatedNumberState {
    currentValue: number,
    frame: number,
    currentTime: number,
    startTime: number,
    fromValue: number,
}

export default class AnimatedNumber extends Component<AnimatedNumberProps, AnimatedNumberState> {

    state: AnimatedNumberState = {
        currentValue: 0,
        frame: 0,
        currentTime: 0,
        startTime: 0,
        fromValue: 0,
    }
    totalFrames: number
    tweenStep: number
    tweenHandle: number

    static defaultProps = {
        component: 'span',
        initialValue: 0,
        stepPrecision: 2,
        duration: ANIMATION_DURATION,
        value: 0,
        formatValue: (n: number) => `${n}`,
        frameStyle: () => { },
    }

    constructor(props: AnimatedNumberProps) {
        super(props)
        this.state = {
            ...this.state,
            currentValue: props.initialValue
        }
    }

    componentDidMount() {
        this.prepareTween()
    }

    componentWillReceiveProps(nextProps: AnimatedNumberProps) {

        if (this.state.currentValue === nextProps.value) {
            return
        }

        if (this.tweenHandle) {
            this.endTween()
        }

        this.prepareTween()
    }

    componentWillUnmount() {
        this.endTween()
    }

    prepareTween() {
        this.tweenHandle = raf((timestamp) => {
            this.tweenValue(timestamp, true)
        })
    }

    endTween() {
        raf.cancel(this.tweenHandle)
        this.setState({
            ...this.state,
            currentValue: this.props.value
        })
    }

    ensureSixtyFps(timestamp: number) {

        const { currentTime } = this.state

        return !currentTime || (timestamp - currentTime > 16)
    }

    tweenValue(timestamp: number, start: boolean) {

        if (!this.ensureSixtyFps(timestamp)) {
            this.tweenHandle = raf(this.tweenValue.bind(this))
            return
        }

        const { value, duration } = this.props

        const { currentValue } = this.state
        const currentTime = timestamp
        const startTime = start ? timestamp : this.state.startTime
        const fromValue = start ? currentValue : this.state.fromValue

        let newValue: number

        if (currentTime - startTime >= duration) {
            newValue = value
        } else {
            newValue = fromValue + (
                (value - fromValue) * ((currentTime - startTime) / duration)
            )
        }

        if (newValue === value) {
            this.endTween()
            return
        }

        this.setState({
            currentValue: newValue,
            startTime: startTime ? startTime : currentTime,
            fromValue, currentTime
        })
        this.tweenHandle = raf(this.tweenValue.bind(this))
    }

    render() {
        const { formatValue, value, className, frameStyle, stepPrecision } = this.props
        const { currentValue, fromValue } = this.state

        let { style } = this.props
        let adjustedValue: number = currentValue
        const direction = value - fromValue

        if (currentValue !== value) {
            if (stepPrecision > 0) {
                adjustedValue = Number(currentValue.toFixed(stepPrecision))
            } else if (direction < 0 && stepPrecision === 0) {
                adjustedValue = Math.floor(currentValue)
            } else if (direction > 0 && stepPrecision === 0) {
                adjustedValue = Math.ceil(currentValue)
            }
        }

        const perc = Math.abs((adjustedValue - fromValue) / (value - fromValue) * 100)

        if (frameStyle) {
            const currStyle: (Object | null) = frameStyle(perc)
            if (style && currStyle) {
                style = {
                    ...style,
                    ...currStyle
                }
            } else if (currStyle) {
                style = currStyle
            }
        }

        return React.createElement(
            this.props.component,
            { ...this.props, className, style },
            formatValue ? formatValue(adjustedValue) : adjustedValue
        )
    }
}