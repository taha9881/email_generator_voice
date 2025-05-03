// import './App.css'
import React, { useState, useRef } from 'react';
import { useEffect } from 'react';



function App() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [email, setEmail] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = window.location.href;
  
      if (url.includes('code=')) {
        try {
          const res = await fetch('http://localhost:5001/auth-callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
  
          const data = await res.json();
  
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            alert('Login successful!');
            // Remove code from URL to avoid re-triggering
            window.history.replaceState({}, document.title, '/');
          } else {
            alert('Login failed: ' + data.error);
          }
        } catch (err) {
          console.error('Auth callback error:', err);
          alert('Login processing failed.');
        }
      }
    };
  
    handleAuthCallback();
  }, []);
  
  const handleRecord = async () => {
    if (!recording) {
      setTranscript('');
      setEmail('');
      setRecording(true);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      // Setup waveform visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      const bufferLength = analyserRef.current.fftSize;
      dataArrayRef.current = new Uint8Array(bufferLength);
      drawWaveform();

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => handleStop(stream);
      mediaRecorderRef.current.start();
    } else {
      setRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgba(17, 24, 39, 0.2)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#c084fc'; // theme purple
      canvasCtx.shadowColor = '#c084fc';
      canvasCtx.shadowBlur = 10;

      canvasCtx.beginPath();


      const sliceWidth = canvas.width * 1.0 / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const handleStop = async (stream) => {
    // Stop media tracks
    stream.getTracks().forEach(track => track.stop());

    // Cleanup audio context and animation
    cancelAnimationFrame(animationIdRef.current);
    audioContextRef.current?.close();

    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const transcriptRes = await fetch('http://localhost:5001/transcribe', {
      method: 'POST',
      body: formData,
    });
    const transcriptData = await transcriptRes.json();
    setTranscript(transcriptData.text);

    const llmRes = await fetch('http://localhost:5001/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: transcriptData.text }),
    });
    const llmData = await llmRes.json();
    setEmail(llmData.response);
  };

  const handleLogin = async () => {
    const res = await fetch('http://localhost:5001/auth-url');
    const data = await res.json();
    window.location.href = data.auth_url; // Redirect to Microsoft login
  };
  
  const handleSendEmail = async () => {
    try {
      const res = await fetch('http://localhost:5001/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: email }),
      });
  
      const result = await res.json();
      if (result.status === 'sent') {
        alert('📨 Email sent successfully!');
      } else {
        alert('❌ Failed to send email.');
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert('❌ Error sending email.');
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-6xl glass rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-6">🎙️ Voice Email Generator</h1>

        <p className="text-center text-sm mb-8 text-purple-200">
          Click the button to start recording your voice. Once done, your speech will be transcribed and converted into an editable email draft.
        </p>
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          🔐 Login with Microsoft
        </button>


        <div className="flex justify-center mb-6">
          <button
            onClick={handleRecord}
            className={`transition-all duration-300 text-lg ${
              recording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } text-white px-8 py-3 rounded-full shadow-lg`}
          >
            {recording ? '🔴 Stop Recording' : '🎤 Record Audio'}
          </button>
        </div>

        {recording && (
          <div className="flex justify-center mb-6">
            <canvas ref={canvasRef} width="600" height="100" className="w-full max-w-2xl rounded-md" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">📝 Transcript</h2>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full h-64 p-3 rounded text-sm text-white bg-transparent border border-white/20 resize-none outline-none"
              placeholder="Transcript will appear here..."
            />
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">📧 Generated Email</h2>
            <textarea
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-64 p-3 rounded text-sm text-white bg-transparent border border-white/20 resize-none outline-none"
              placeholder="Generated email will appear here..."
            />
            <div className="mt-4 text-right">
              <button
                onClick={handleSendEmail}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded shadow"
              >
                📤 Send Email
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
