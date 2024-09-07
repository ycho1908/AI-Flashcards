const { Box, Typography, Button } = require("@mui/material")
const { useEffect, useState } = require("react")

const PomodoroTimer = () => {
    const [ sec, setSec ] = useState(0)
    const [ studyTime, setStudyTime ] = useState(false)
    const [ breakTime, setBreakTime ] = useState(false)

    const studyPeriod = 30 * 60
    // 30 minutes
    const breakPeriod = 5 * 60
    // 5 minutes

    useEffect(() => {
        let interval = null

        if (studyTime) {
            interval = setInterval(() => {
                setSec(prevSeconds => {
                    if (prevSeconds <= 0) {
                        if (breakTime) { // will be study period after break
                            setSec(studyPeriod)
                            setBreakTime(false)
                        } else { // will be break period after study
                            setSec(breakPeriod)
                            setBreakTime(true)
                        }
                        return 0
                    }
                    return prevSeconds-1
                })
            }, 1000)
        } else if (!studyTime && sec !== 0) {
            clearInterval(interval)
        }

        return () => clearInterval(interval)
    }, [studyTime, breakTime, sec])

    const formatTime = (secs) => {
        const minutes = Math.floor(secs / 60)
        const seconds = secs % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    const startTimer = () => {
        setSec(studyTime)
        setStudyTime(true)
    }

    const stopTimer = () => {
        setStudyTime(false)
    }

    const resetTimer = () => {
        setStudyTime(false)
        setSec(0)
    }

    return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant='h4'>{breakTime ? 'Break Time' : 'Study Time'}</Typography>
            <Typography variant='h2'>{formatTime(sec)}</Typography>
            <Box sx={{ mt: 2 }}>
                <Button variant='contained' color='primary' onClick={startTimer} disabled={studyTime}>
                    Start
                </Button>
                <Button variant='contained' color='secondary' onClick={stopTimer} sx={{ ml: 2 }}>
                    Stop
                </Button>
                <Button variant='outlined' color='error' onClick={resetTimer} sx={{ ml: 2 }}>
                    Reset
                </Button>
            </Box>
        </Box>
    )
}

export default PomodoroTimer;