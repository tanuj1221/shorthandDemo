import React, { useRef, useState, useEffect } from 'react';
import { 
  IconButton,
  Slider,
  Typography,
  Box,
  Stack,
  CircularProgress
} from '@mui/material';
import { 
  PlayArrow, 
  Pause,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';

const formatTime = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    
    const audio = audioRef.current;

    const handleLoadedData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setError('Failed to load audio');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set initial volume
    audio.volume = volume / 100;

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play audio');
    }
  };

  const handleVolumeChange = (_, newValue) => {
    setVolume(newValue);
    audioRef.current.volume = newValue / 100;
    setIsMuted(newValue === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume / 100;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const handleSeek = (_, newValue) => {
    const time = (newValue / 100) * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setProgress(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton 
            onClick={togglePlayPause} 
            disabled={!audioUrl || isLoading || error}
            color="primary"
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : isPlaying ? (
              <Pause />
            ) : (
              <PlayArrow />
            )}
          </IconButton>

          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <Slider
              value={progress}
              onChange={handleSeek}
              disabled={!audioUrl || isLoading || error}
              sx={{ color: 'primary.main' }}
            />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mt: 0.5
            }}>
              <Typography variant="caption" color="text.secondary">
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: 100 }}>
            <IconButton onClick={toggleMute} size="small" disabled={!audioUrl || error}>
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={!audioUrl || error}
              size="small"
              sx={{ color: 'text.secondary' }}
            />
          </Stack>
        </Stack>

        {error && (
          <Typography color="error" variant="caption" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default AudioPlayer;