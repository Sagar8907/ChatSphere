import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import useAuthStore from "../store/authStore";
import SimplePeer from "simple-peer";

const ControlButton = ({ onClick, active, icon }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-colors ${
      active ? "bg-white/10 hover:bg-white/20" : "bg-red-500/20 text-red-400"
    }`}
  >
    {icon}
  </motion.button>
);

const PeerVideo = ({ peer }) => {
  const ref = useRef();
  useEffect(() => {
    peer.on("stream", (remoteStream) => {
      if (ref.current) ref.current.srcObject = remoteStream;
    });
  }, [peer]);

  return (
    <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
  );
};

const VideoPage = () => {
  const { workspaceId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuthStore();

  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const myVideo = useRef();
  const peersRef = useRef([]);

  const joinCall = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(currentStream);
      setJoined(true);

      setTimeout(() => {
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      }, 100);

      socket.emit("join-room", workspaceId);

      socket.on("user-joined", (socketId) => {
        const peer = createPeer(socketId, currentStream);
        peersRef.current.push({ peerId: socketId, peer });
        setPeers((prev) => [...prev, { peerId: socketId, peer }]);
      });

      socket.on("offer", ({ offer, from }) => {
        const peer = addPeer(offer, from, currentStream);
        peersRef.current.push({ peerId: from, peer });
        setPeers((prev) => [...prev, { peerId: from, peer }]);
      });

      socket.on("answer", ({ answer, from }) => {
        const peerObj = peersRef.current.find((p) => p.peerId === from);
        peerObj?.peer.signal(answer);
      });

      socket.on("ice-candidate", ({ candidate, from }) => {
        const peerObj = peersRef.current.find((p) => p.peerId === from);
        peerObj?.peer.signal(candidate);
      });

      socket.on("user-left", (socketId) => {
        const peerObj = peersRef.current.find((p) => p.peerId === socketId);
        peerObj?.peer.destroy();
        peersRef.current = peersRef.current.filter((p) => p.peerId !== socketId);
        setPeers((prev) => prev.filter((p) => p.peerId !== socketId));
      });

    } catch (err) {
      console.log("Camera/Mic error:", err);
    }
  };

  const createPeer = (socketId, currentStream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: currentStream,
    });

    peer.on("signal", (data) => {
      socket.emit("offer", { offer: data, to: socketId });
    });

    return peer;
  };

  const addPeer = (offer, from, currentStream) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: currentStream,
    });

    peer.on("signal", (data) => {
      socket.emit("answer", { answer: data, to: from });
    });

    peer.signal(offer);
    return peer;
  };

  const leaveCall = () => {
    socket.emit("leave-room", workspaceId);
    stream?.getTracks().forEach((track) => track.stop());
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current = [];
    setPeers([]);
    setStream(null);
    setJoined(false);
  };

  const toggleMic = () => {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCamOn(!camOn);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8 flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <h1 className="text-2xl font-bold"
            style={{ background: "linear-gradient(to right, #a78bff, #00c8b4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Workspace Call
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {joined ? `${peers.length + 1} participant(s) active` : "Ready to join"}
          </p>
        </div>
      </header>

      {/* Landing State */}
      {!joined && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            📹
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Start the meeting</h2>
            <p className="mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              Connect with your team members in this workspace.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinCall}
            className="px-10 py-4 rounded-2xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6339ff, #00c8b4)" }}
          >
            Join Meeting 🚀
          </motion.button>
        </div>
      )}

      {/* Video Grid */}
      {joined && (
        <div className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* My Video */}
            <div className="relative aspect-video rounded-3xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <video ref={myVideo} autoPlay muted playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {user?.name} (You)
              </div>
              {!camOn && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.7)" }}>
                  <span className="text-4xl">🎥</span>
                </div>
              )}
            </div>

            {/* Peer Videos */}
            {peers.map(({ peerId, peer }) => (
              <div key={peerId} className="relative aspect-video rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <PeerVideo peer={peer} />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-xs font-medium"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Participant
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 rounded-3xl"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <ControlButton onClick={toggleMic} active={micOn} icon={micOn ? "🎤" : "🔇"} />
            <ControlButton onClick={toggleCam} active={camOn} icon={camOn ? "📹" : "🚫"} />
            <div className="w-px h-8 mx-2" style={{ background: "rgba(255,255,255,0.1)" }} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={leaveCall}
              className="px-8 py-3 rounded-2xl font-medium"
              style={{
                background: "rgba(255,50,50,0.2)",
                color: "#ff6b6b",
                border: "1px solid rgba(255,50,50,0.2)",
              }}
            >
              Leave
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;