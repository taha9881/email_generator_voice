// import './App.css'
import React, { useState, useRef } from 'react';
import { useEffect } from 'react';

<<<<<<< HEAD
function App() {
  const apiUrl = import.meta.env.VITE_APP_BASE_URL;
  console.log('API URL:', apiUrl);

=======


function App() {
>>>>>>> 2a1f060 (init commit)
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
<<<<<<< HEAD
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
  const [toEmail, setToEmail] = useState(localStorage.getItem('toEmail') || '');
  const [ccEmail, setCcEmail] = useState(localStorage.getItem('ccEmail') || '');
  const [subject, setSubject] = useState('');
  const hasHandledAuth = useRef(false);
=======
>>>>>>> 2a1f060 (init commit)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = window.location.href;
<<<<<<< HEAD

      if (hasHandledAuth.current || !url.includes('code=')) return;
      hasHandledAuth.current = true;

      try {
        const res = await fetch(`${apiUrl}/auth-callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          setIsLoggedIn(true);
          alert('Login successful!');
          window.history.replaceState({}, document.title, '/');
        } else {
          alert('Login failed: ' + data.error);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        alert('Login processing failed.');
      }
    };
=======
  
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
  
>>>>>>> 2a1f060 (init commit)
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
<<<<<<< HEAD

=======
      drawWaveform();
>>>>>>> 2a1f060 (init commit)

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => handleStop(stream);
      mediaRecorderRef.current.start();
    } else {
<<<<<<< HEAD
      // Stop recording
      setRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  };

=======
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

>>>>>>> 2a1f060 (init commit)
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

<<<<<<< HEAD
    const transcriptRes = await fetch(`${apiUrl}/transcribe`, {
=======
    const transcriptRes = await fetch('http://localhost:5001/transcribe', {
>>>>>>> 2a1f060 (init commit)
      method: 'POST',
      body: formData,
    });
    const transcriptData = await transcriptRes.json();
    setTranscript(transcriptData.text);

<<<<<<< HEAD
    const llmRes = await fetch(`${apiUrl}/generate`, {
=======
    const llmRes = await fetch('http://localhost:5001/generate', {
>>>>>>> 2a1f060 (init commit)
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: transcriptData.text }),
    });
    const llmData = await llmRes.json();
<<<<<<< HEAD
    setEmail(llmData.response.Body);
    setSubject(llmData.response.Subject);
  };

  const handleLogin = async () => {
    const res = await fetch(`${apiUrl}/auth-url`);
=======
    setEmail(llmData.response);
  };

  const handleLogin = async () => {
    const res = await fetch('http://localhost:5001/auth-url');
>>>>>>> 2a1f060 (init commit)
    const data = await res.json();
    window.location.href = data.auth_url; // Redirect to Microsoft login
  };
  
  const handleSendEmail = async () => {
    try {
<<<<<<< HEAD
      const response = await fetch(`${apiUrl}/send-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body: email,
          to_email: toEmail,
          cc_email: ccEmail
        }),
      });
      const result = await response.json();
      alert("Email sent!");
    } catch (error) {
      console.error("Failed to send email", error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    alert('Logged out.');
  };

  return (
      <div className="w-screen h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white font-sans flex items-center justify-center px-4 py-6">
        <div className="w-full glass max-w-6xl h-full bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-6 flex flex-col justify-between">
            {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">🎙️ Voice Email Generator</h1>
            <div className="flex gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    disabled
                    className="bg-green-600 text-sm px-3 py-1 rounded shadow opacity-75 cursor-not-allowed"
                  >
                    ✅ Logged In
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-sm px-3 py-1 rounded shadow"
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1 rounded shadow"
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>
  
          {/* Main Content */}
          <div className="grid grid-cols-2 gap-6 flex-1">
            {/* Transcript Section */}
            <div className="flex flex-col bg-white/10 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">📝 Transcript</h2>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-full p-3 rounded text-sm text-white bg-transparent border border-white/20 resize-none outline-none"
                placeholder="Transcript will appear here..."
              />
              <button
                onClick={handleRecord}
                className={`mt-4 transition-all duration-300 text-sm ${
                  recording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded shadow self-end`}
              >
                {recording ? "🔴 Stop Recording" : "🎤 Start Recording"}
              </button>
            </div>
  
            {/* Email Section */}
            <div className="flex flex-col bg-white/10 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-2">📧 Generate Email</h2>
  
              {/* Subject Field */}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="📌 Subject"
                className="w-full mb-2 px-3 py-2 rounded bg-white/10 border border-white/20 text-sm text-black outline-none"
              />
  
              {/* To & CC Fields Side-by-Side */}
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-xs mb-1 block text-purple-200">To</label>
                  <input
                    type="email"
                    value={toEmail}
                    onChange={(e) => {
                      setToEmail(e.target.value);
                      localStorage.setItem("toEmail", e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-sm text-black outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs mb-1 block text-purple-200">CC</label>
                  <input
                    type="email"
                    value={ccEmail}
                    onChange={(e) => {
                      setCcEmail(e.target.value);
                      localStorage.setItem("ccEmail", e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-sm text-black outline-none"
                  />
                </div>
              </div>
  
              {/* Email Body */}
              <textarea
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full flex-1 p-3 rounded text-sm text-white bg-transparent border border-white/20 resize-none outline-none"
                placeholder="Generated email will appear here..."
              />
  
              <div className="mt-4 text-right">
                <button
                  onClick={handleSendEmail}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded shadow text-sm"
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
=======
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
>>>>>>> 2a1f060 (init commit)
