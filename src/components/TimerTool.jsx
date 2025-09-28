import { useState, useEffect, useRef } from 'react';
import SEOHead from './SEOHead';

function TimerTool() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [laps, setLaps] = useState([]);
  const [lapCounter, setLapCounter] = useState(0);
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'countdown'
  const [countdownTime, setCountdownTime] = useState(0);
  const [inputTime, setInputTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const intervalRef = useRef(null);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play sound
  const playSound = () => {
    if (soundEnabled) {
      // Create audio context for beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  // Start timer
  const startTimer = () => {
    if (mode === 'countdown' && countdownTime === 0) {
      const totalSeconds = inputTime.hours * 3600 + inputTime.minutes * 60 + inputTime.seconds;
      if (totalSeconds > 0) {
        setCountdownTime(totalSeconds);
        setTime(totalSeconds);
      } else {
        return;
      }
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  // Resume timer
  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (mode === 'stopwatch') {
      setTime(0);
    } else {
      setTime(countdownTime);
    }
    setLaps([]);
    setLapCounter(0);
  };

  // Switch mode
  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    setIsPaused(false);
    setLaps([]);
    setLapCounter(0);
    if (newMode === 'stopwatch') {
      setTime(0);
    } else {
      setTime(countdownTime);
    }
  };

  // Set preset time
  const setPresetTime = (seconds) => {
    setCountdownTime(seconds);
    setTime(seconds);
    setInputTime({
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60
    });
  };

  // Update input time
  const updateInputTime = (field, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setInputTime(prev => ({
      ...prev,
      [field]: field === 'hours' ? Math.min(23, numValue) : Math.min(59, numValue)
    }));
  };

  // Add lap
  const addLap = () => {
    if (isRunning || isPaused) {
      const newLap = {
        id: lapCounter + 1,
        time: time,
        formattedTime: formatTime(time),
        timestamp: new Date().toLocaleTimeString()
      };
      setLaps(prev => [newLap, ...prev]);
      setLapCounter(prev => prev + 1);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (mode === 'stopwatch') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              setIsRunning(false);
              playSound();
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRunning && !isPaused) {
          startTimer();
        } else if (isRunning) {
          pauseTimer();
        } else if (isPaused) {
          resumeTimer();
        }
      } else if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        resetTimer();
      } else if (e.code === 'KeyL' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        addLap();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, isPaused]);

  return (
    <>
      <SEOHead 
        title="Enhanced Timer Tool - Laboratory Timer with Countdown | ReseachBub"
        description="Professional laboratory timer tool with stopwatch, countdown timer, lap recording, preset times, sound alerts, and keyboard shortcuts. Perfect for scientific experiments and lab work."
        keywords="laboratory timer, countdown timer, stopwatch, experiment timer, scientific timer, lab timer, research timer, lap timer, preset timer, sound alerts, keyboard shortcuts, laboratory software"
        url="https://reseachbub.org/timer-tool"
        type="website"
      />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Enhanced Laboratory Timer
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional timing tool with stopwatch, countdown timer, lap recording, preset times, and sound alerts
            </p>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => switchMode('stopwatch')}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  mode === 'stopwatch'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Stopwatch
              </button>
              <button
                onClick={() => switchMode('countdown')}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                  mode === 'countdown'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Countdown
              </button>
            </div>

            {/* Countdown Settings */}
            {mode === 'countdown' && (
              <div className="space-y-4">
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => setShowTimeInput(!showTimeInput)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {showTimeInput ? 'Hide' : 'Set'} Custom Time
                  </button>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => setPresetTime(60)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      1m
                    </button>
                    <button
                      onClick={() => setPresetTime(300)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      5m
                    </button>
                    <button
                      onClick={() => setPresetTime(600)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      10m
                    </button>
                    <button
                      onClick={() => setPresetTime(1800)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      30m
                    </button>
                    <button
                      onClick={() => setPresetTime(3600)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-colors"
                    >
                      1h
                    </button>
                  </div>
                </div>

                {showTimeInput && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-center items-center gap-4">
                      <div className="text-center">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={inputTime.hours}
                          onChange={(e) => updateInputTime('hours', e.target.value)}
                          className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono text-lg"
                        />
                      </div>
                      <div className="text-2xl font-bold text-gray-400">:</div>
                      <div className="text-center">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={inputTime.minutes}
                          onChange={(e) => updateInputTime('minutes', e.target.value)}
                          className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono text-lg"
                        />
                      </div>
                      <div className="text-2xl font-bold text-gray-400">:</div>
                      <div className="text-center">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seconds</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={inputTime.seconds}
                          onChange={(e) => updateInputTime('seconds', e.target.value)}
                          className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono text-lg"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <button
                        onClick={() => {
                          const totalSeconds = inputTime.hours * 3600 + inputTime.minutes * 60 + inputTime.seconds;
                          if (totalSeconds > 0) {
                            setPresetTime(totalSeconds);
                            setShowTimeInput(false);
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Set Time
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sound Toggle */}
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  soundEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {soundEnabled ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  )}
                </svg>
                Sound {soundEnabled ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <div className="text-center">
              <div className="mb-8">
                <div className={`text-6xl lg:text-8xl font-mono font-bold mb-4 transition-colors ${
                  mode === 'countdown' && time <= 10 && time > 0
                    ? 'text-red-500 animate-pulse'
                    : mode === 'countdown' && time === 0 && countdownTime > 0
                    ? 'text-red-600 animate-bounce'
                    : 'text-gray-900'
                }`}>
                  {formatTime(time)}
                </div>
                
                {/* Countdown Progress Bar */}
                {mode === 'countdown' && countdownTime > 0 && (
                  <div className="w-full max-w-md mx-auto mb-4">
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${((countdownTime - time) / countdownTime) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {countdownTime > 0 ? `${Math.round(((countdownTime - time) / countdownTime) * 100)}% Complete` : ''}
                    </div>
                  </div>
                )}

                {/* Countdown Finished Message */}
                {mode === 'countdown' && time === 0 && countdownTime > 0 && (
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mb-4">
                    <div className="text-2xl font-bold text-red-700 mb-2">⏰ Time's Up!</div>
                    <div className="text-red-600">Countdown timer has finished</div>
                  </div>
                )}
                
                {/* Control Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {!isRunning && !isPaused && (
                    <button
                      onClick={startTimer}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Start Timer
                    </button>
                  )}
                  
                  {isRunning && (
                    <button
                      onClick={pauseTimer}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Pause
                    </button>
                  )}
                  
                  {isPaused && (
                    <button
                      onClick={resumeTimer}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Resume
                    </button>
                  )}
                  
                  <button
                    onClick={addLap}
                    disabled={!isRunning && !isPaused}
                    className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Add Lap
                  </button>
                  
                  <button
                    onClick={resetTimer}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset
                  </button>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><kbd className="bg-gray-200 px-2 py-1 rounded">Space</kbd> Start/Pause/Resume</div>
                    <div><kbd className="bg-gray-200 px-2 py-1 rounded">Ctrl+L</kbd> Add Lap</div>
                    <div><kbd className="bg-gray-200 px-2 py-1 rounded">Ctrl+R</kbd> Reset</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laps Section */}
          {laps.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Lap Times
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {laps.map((lap, index) => (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {lap.id}
                      </div>
                      <div>
                        <div className="font-mono text-lg font-semibold text-gray-900">
                          {lap.formattedTime}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lap.timestamp}
                        </div>
                      </div>
                    </div>
                    
                    {index > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Split Time</div>
                        <div className="font-mono font-semibold text-gray-700">
                          {formatTime(lap.time - laps[index + 1]?.time || lap.time)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => setLaps([])}
                  className="text-red-500 hover:text-red-700 font-semibold transition-colors"
                >
                  Clear All Laps
                </button>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dual Mode</h3>
                <p className="text-gray-600 text-sm">
                  Stopwatch and countdown timer modes
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preset Times</h3>
                <p className="text-gray-600 text-sm">
                  Quick preset buttons for common durations
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sound Alerts</h3>
                <p className="text-gray-600 text-sm">
                  Audio notifications when timer finishes
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keyboard Shortcuts</h3>
                <p className="text-gray-600 text-sm">
                  Quick controls for efficient lab work
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default TimerTool;
