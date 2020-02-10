import React, { Component } from 'react'
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import moment from 'moment'

function Timer({interval, style}) {
    const pad = (n) => n < 10 ? '0' + n : n
    const duration = moment.duration(interval)
    const centiseconds = Math.floor(duration.milliseconds() / 10)
    return (
        <View style={styles.timerContainer}>
            <Text style={style}>{pad(duration.minutes())}:</Text>
            <Text style={style}>{pad(duration.seconds())},</Text>
            <Text style={style}>{pad(centiseconds)}</Text>
        </View>
        
        )
}

function RoundButton({title, color, background, onPress, disabled}){
    return (
        <TouchableOpacity 
            style={[styles.button, {backgroundColor: background}]} 
            onPress={() => !disabled && onPress()} 
            activeOpacity={disabled ? 1.0 : 0.5}>
                <View style={styles.buttonBorder}>
                    <Text style={[styles.buttonTitle, {color}]}>{title}</Text>
                </View>
        </TouchableOpacity>
    )
}

function Lap({number, interval, fastest, slowest}){
    const lapStyle = [
        styles.lapText,
        fastest && styles.fastest,
        slowest && styles.slowest,
    ]
    return (
        <View style={styles.lap}>
            <Text style={[lapStyle, {width: 80}]}>Lap {number}</Text>
            <Timer style={lapStyle} interval={interval}/>
        </View>
    )
}

function LapsTable({laps, timer}) {
    const finishedLaps = laps.slice(1)
    let min = Number.MAX_SAFE_INTEGER
    let max = Number.MAX_SAFE_INTEGER
    if(finishedLaps.length >= 2) {
        finishedLaps.forEach(lap => {
            if(lap < min) min = lap
            if(lap > max) max = lap
        })
    }
    return (
        <ScrollView style={styles.scrollView}>
          {laps.map((lap, index)=> (
              <Lap 
                number={laps.length - index} 
                key={laps.length - index} 
                interval={index === 0 ? timer + lap : lap}
                fastest={lap === min}
                slowest={lap === max}
                />
          ))}  
        </ScrollView>
    )
}

function ButtonsRow({children}) {
    return (
        <View style={styles.buttonRow}>{children}</View>
    )
}
export default class StopWatch extends Component {
    constructor(props){
        super(props)
        this.state = {
            start: 0,
            now: 0,
            laps: [],
            }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    start = () => {
        const now = new Date().getTime()
        this.setState({
            start: now,
            now,
            laps: [0],
        })
        this.timer = setInterval(() => {
            this.setState({now: new Date().getTime()})
        }, 100);
    }

    lap = () => {
        const timestamp = new Date().getTime()
        const {laps, now, start} = this.state
        const [fisrtLap, ...other] = laps
        this.setState({
            laps: [0, fisrtLap + now - start, ...other],
            start: timestamp,
            now: timestamp,
        })
    }

    reset = () => {
      this.setState({
          laps: [],
          start: 0,
          now: 0,
      })  
    }

    resume = () => {
        const now = new Date().getTime()
        this.setState({
            start: now,
            now,
        })
        this.timer = setInterval(()=>{
            this.setState({now: new Date().getTime()})
        }, 100)
    }

    stop = () => {
        clearInterval(this.timer)
        const {laps, now, start} = this.state
        const [fisrtLap, ...other] = laps
        this.setState({
            laps: [fisrtLap + now - start, ...other],
            start: 0,
            now: 0,
        })
    }

    render() {
        const {start, now, laps} = this.state
        const timer = now - start
        return (
            <View style={styles.container}>
                <Timer 
                    interval={laps.reduce((total, curr) => total + curr, 0) + timer} 
                    style={styles.timer}
                />
                {laps.length === 0 && (
                    <ButtonsRow>
                        <RoundButton 
                            title='Lap' 
                            color='#8B8B90' 
                            background='#151515'
                            disabled/>
                        <RoundButton 
                            title='Start' 
                            color='#50D167' 
                            background='#1B361F' 
                            onPress={this.start}/>
                    </ButtonsRow>
                )}
                { start > 0 && (
                    <ButtonsRow>
                        <RoundButton 
                            title='Lap' 
                            color='#ffffff' 
                            background='#3D3D3D'
                            onPress={this.lap}/>
                        <RoundButton 
                            title='Stop'
                            color='#E33935' 
                            background='#3C1715' 
                            onPress={this.stop}/>
                    </ButtonsRow>
                )}
                { laps.length > 0 && start === 0 && (
                    <ButtonsRow>
                        <RoundButton 
                            title='Reset' 
                            color='#ffffff' 
                            background='#3D3D3D'
                            onPress={this.reset}/>
                        <RoundButton 
                            title='Start' 
                            color='#50D167' 
                            background='#1B361F' 
                            onPress={this.resume}/>
                    </ButtonsRow>
                )}
                <LapsTable laps={laps} timer={timer}/>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    timerContainer: {
        flexDirection: 'row'
    },
    timer: {
        fontSize: 70,
        color: '#fff',
        width: 100,
    },
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonBorder: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonTitle: {
        fontSize: 15
    },
    buttonRow: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        marginTop: 100,
        marginBottom: 30,
    },
    lapText: {
        color: '#fff',
        fontSize: 18,
        width: 28,
    },
    lap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: '#151515',
        borderTopWidth: 1,
        paddingVertical: 10
    },
    scrollView: {
        alignSelf: 'stretch',
    },
    fastest: {
        color: '#4BC05F',
    },
    slowest: {
        color: '#CC3531',
    },

})