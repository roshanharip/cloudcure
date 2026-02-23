import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    User, Loader2, AlertCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socket';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';
import { toast } from 'sonner';

export default function VideoCallPage() {
    const { otherUserId } = useParams<{ appointmentId: string; otherUserId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState<'initiating' | 'connecting' | 'connected' | 'ended' | 'error'>('initiating');
    const [error, setError] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callDurationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const ICE_SERVERS = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // Use ref to avoid stale closure in endCall
    const endCall = useCallback((emitEvent = true) => {
        // Stop local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        // Close RTCPeerConnection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        // Stop duration timer
        if (callDurationTimerRef.current) {
            clearInterval(callDurationTimerRef.current);
        }
        // Notify remote peer
        if (emitEvent && otherUserId) {
            socketService.endCall(otherUserId);
        }
        setCallStatus('ended');
        toast.info('Call ended');
        setTimeout(() => navigate(-1), 1500);
    }, [otherUserId, navigate]);

    const setupPeerConnection = useCallback(() => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && otherUserId) {
                socketService.sendIceCandidate(otherUserId, event.candidate);
            }
        };

        pc.ontrack = (event) => {
            const stream = event.streams[0] ?? null;
            setRemoteStream(stream);
            if (remoteVideoRef.current && stream) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                setCallStatus('connected');
                // Start call duration timer
                callDurationTimerRef.current = setInterval(() => {
                    setCallDuration((d) => d + 1);
                }, 1000);
            }
            if (pc.connectionState === 'failed') {
                setError('Connection failed. Please check your network and try again.');
                setCallStatus('error');
            }
            if (pc.connectionState === 'disconnected') {
                setError('The other party disconnected.');
                setCallStatus('error');
            }
        };

        peerConnection.current = pc;
        return pc;
    }, [otherUserId]);

    // Main effect: acquire media and set up signaling
    useEffect(() => {
        let cancelled = false;

        const initCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                const pc = setupPeerConnection();
                stream.getTracks().forEach((track) => pc.addTrack(track, stream));

                if (user?.role === 'doctor') {
                    setCallStatus('connecting');
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    if (otherUserId) socketService.sendOffer(otherUserId, offer);
                } else {
                    // Patient waits for doctor's offer
                    setCallStatus('connecting');
                }
            } catch (err) {
                if (!cancelled) {
                    const msg = err instanceof Error && err.name === 'NotAllowedError'
                        ? 'Camera/microphone permission denied. Please allow access and reload.'
                        : 'Could not access camera or microphone. Check device settings.';
                    setError(msg);
                    setCallStatus('error');
                }
            }
        };

        void initCall();

        // WebRTC signaling handlers
        socketService.onOffer(async (data) => {
            if (data.senderId !== otherUserId) return;
            setCallStatus('connecting');
            const pc = peerConnection.current || setupPeerConnection();
            // Add existing tracks to the new pc if needed
            if (localStreamRef.current && pc.getSenders().length === 0) {
                localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (otherUserId) socketService.sendAnswer(otherUserId, answer);
        });

        socketService.onAnswer(async (data) => {
            if (data.senderId !== otherUserId) return;
            if (peerConnection.current?.signalingState === 'have-local-offer') {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socketService.onIceCandidate((data) => {
            if (data.senderId !== otherUserId) return;
            if (peerConnection.current) {
                peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {
                    // Ignore stale ICE candidates
                });
            }
        });

        socketService.onCallEnded(() => {
            if (!cancelled) endCall(false);
        });

        return () => {
            cancelled = true;
            // Clean up tracks but don't emit endCall (component may unmount without user action)
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
                peerConnection.current = null;
            }
            if (callDurationTimerRef.current) {
                clearInterval(callDurationTimerRef.current);
            }
        };
    }, [otherUserId, setupPeerConnection, user?.role, endCall]);

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = isMuted; // toggle
            });
            setIsMuted((prev) => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = isVideoOff; // toggle
            });
            setIsVideoOff((prev) => !prev);
        }
    };

    const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (callStatus === 'error') {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Call Error</h1>
                <p className="text-zinc-400 mb-6 text-center max-w-sm">{error || 'An unexpected error occurred'}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    if (callStatus === 'ended') {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-6">
                <PhoneOff className="h-16 w-16 text-zinc-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Call Ended</h1>
                <p className="text-zinc-400 mb-2">Duration: {formatDuration(callDuration)}</p>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mt-2" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-zinc-950 overflow-hidden relative flex items-center justify-center">
            {/* Remote Video (Full Screen) */}
            <div className="absolute inset-0 z-0 bg-zinc-900">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                            <User className="h-12 w-12 text-zinc-500" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-zinc-300 font-medium">
                                {callStatus === 'initiating' ? 'Setting up your camera...' : 'Connecting...'}
                            </p>
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    </div>
                )}
            </div>

            {/* Call duration overlay */}
            {callStatus === 'connected' && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-zinc-900/70 backdrop-blur px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <Clock className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400 text-sm font-mono font-medium">{formatDuration(callDuration)}</span>
                </div>
            )}

            {/* Local Video (PiP) */}
            <div className={cn(
                'absolute top-6 right-6 w-48 h-32 md:w-64 md:h-44 z-10 transition-all rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-800',
                isVideoOff && 'flex items-center justify-center',
            )}>
                {isVideoOff ? (
                    <VideoOff className="h-8 w-8 text-zinc-500" />
                ) : (
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-10 inset-x-0 z-20 flex justify-center">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className={cn(
                            'h-12 w-12 rounded-full transition-all',
                            isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700',
                        )}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleVideo}
                        className={cn(
                            'h-12 w-12 rounded-full transition-all',
                            isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700',
                        )}
                        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    </Button>

                    <div className="h-8 w-px bg-white/10 mx-2" />

                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                        onClick={() => endCall(true)}
                        title="End call"
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
